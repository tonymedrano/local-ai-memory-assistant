import { HybridRetriever } from "../hybrid/hybrid.retriever.js";

import type { RankedResult, Reranker } from "../reranker.types.js";

import { QualityScoringService } from "../quality/quality.service.js";
import { DiversityService } from "../quality/diversity.service.js";
import { DuplicateDetector } from "../quality/duplicate/duplicate.detector.js";

import { QueryAnalyzer } from "../intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "../strategy/retrieval.strategy.selector.js";

import type {
  RetrievalRequest,
  RetrievalPipelineResult,
} from "../retrieval.types.js";

import { Profiler } from "../../profiling/profiler.js";

import type { MetricsService } from "../../metrics/metrics.service.js";

import type { FeedbackCollector } from "../../ltr/index.js";

import type { LTRRanker } from "../../ltr/ranking/ltr.ranker.js";

import type { FeedbackDrivenReranker } from "../../ltr/feedback/feedback-driven.reranker.js";

import type { ContextModel } from "../../context/model/context.model.js";
import { applyContextToRetrievalStrategy } from "../../context/retrieval/context.retrieval.pipeline.js";
import { config } from "../../config.js";

export class RetrievalPipeline {
  constructor(
    private readonly hybridRetriever: HybridRetriever,
    private readonly ltrRanker: LTRRanker,
    private readonly reranker: Reranker,
    private readonly qualityScoring: QualityScoringService,
    private readonly duplicateDetector: DuplicateDetector,
    private readonly diversityService: DiversityService,
    private readonly metricsService?: MetricsService,
    private readonly feedbackCollector?: FeedbackCollector,
    private readonly feedbackReranker?: FeedbackDrivenReranker,
    private readonly queryAnalyzer: QueryAnalyzer = new QueryAnalyzer(),
    private readonly strategySelector: RetrievalStrategySelector = new RetrievalStrategySelector(),
  ) {}

  async retrieve(
    request: RetrievalRequest,
    context?: ContextModel,
  ): Promise<RetrievalPipelineResult> {
    const retrievalContext = config.contextAwareRetrieval
      ? context ?? request.context
      : undefined;
    const queryProfile = this.queryAnalyzer.analyze(request.query);

    const baseStrategy =
      request.options?.strategy ?? this.strategySelector.select(queryProfile);
    const { strategy } = applyContextToRetrievalStrategy(
      baseStrategy,
      queryProfile,
      retrievalContext,
    );

    console.log("\n=== QUERY INTELLIGENCE ===");

    console.dir(
      {
        profile: queryProfile,
        strategy,
        contextAware: retrievalContext !== undefined,
      },
      { depth: null },
    );

    const start = Date.now();

    const profiler = new Profiler();

    // 1. Retrieval

    const candidates = await profiler.trace(
      `Retrieval (${strategy.mode})`,
      () =>
        this.hybridRetriever.search({
          query: request.query,
          strategy,
          options: request.options,
          context: retrievalContext,
        }),
    );

    // 1.1 Strategy candidate limiting

    const candidateLimit = strategy.topK;

    const limitedCandidates = candidates.slice(0, candidateLimit);

    // 2. Ranking

    let rankedCandidates: RankedResult[];

    if (request.options?.useLTR === false) {
      rankedCandidates = limitedCandidates.map((result) => ({
        ...result,
        rerankScore: result.score,
      }));
    } else {
      const ltrRanked = await profiler.trace("LTR Ranking", () =>
        Promise.resolve(
          this.ltrRanker.rank(
            request.query,
            limitedCandidates,
            retrievalContext,
          ),
        ),
      );

      rankedCandidates = ltrRanked.map(({ result, score }) => ({
        ...result,
        score,
        rerankScore: score,
      }));
    }

    // 3. Reranking

    let ranked: RankedResult[];

    if (strategy.rerank) {
      ranked = await profiler.trace("Reranking", () =>
        this.reranker.rerank(request.query, rankedCandidates),
      );
    } else {
      ranked = rankedCandidates;
    }

    // 4. Quality scoring

    const qualityRanked = await profiler.trace("Quality Scoring", () =>
      this.qualityScoring.score(ranked),
    );

    // 5. Duplicate detection

    const unique = await profiler.trace("Duplicate Detection", () =>
      this.duplicateDetector.removeDuplicates(qualityRanked),
    );

    // 6. Diversity

    const requiredSources =
      strategy.mode === "knowledge" || strategy.mode === "hybrid_graph"
        ? ["graph-evidence"]
        : undefined;

    const finalResults = await profiler.trace("Diversity Filtering", () =>
      this.diversityService.filter(unique.results, request.limit ?? 5, {
        requiredSources,
        minimumPerSource: 2,
      }),
    );

    // Feedback

    this.feedbackCollector?.resultReturned(request.query, finalResults);

    console.table(profiler.summary());

    const trace = profiler.export(request.query);

    if (this.metricsService) {
      await this.metricsService.record(trace);
    }

    return {
      memories: finalResults,

      elapsedMs: Date.now() - start,

      trace,

      quality: {
        averageScore: this.average(
          finalResults.map((item) => item.qualityScore.finalScore),
        ),

        averageRelevance: this.average(
          finalResults.map((item) => item.qualityScore.relevance),
        ),

        averageConfidence: this.average(
          finalResults.map((item) => item.qualityScore.confidence),
        ),

        duplicatesRemoved: unique.duplicatesRemoved,
      },
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
