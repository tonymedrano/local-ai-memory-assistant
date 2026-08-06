import { HybridRetriever } from "../hybrid/hybrid.retriever.js";

import type { Reranker } from "../reranker.types.js";

import { QualityScoringService } from "../quality/quality.service.js";
import { DiversityService } from "../quality/diversity.service.js";
import { DuplicateDetector } from "../quality/duplicate/duplicate.detector.js";

import type {
  RetrievalRequest,
  RetrievalPipelineResult,
} from "../retrieval.types.js";

import { Profiler } from "../../profiling/profiler.js";

import type { MetricsService } from "../../metrics/metrics.service.js";

import type { FeedbackCollector } from "../../ltr/index.js";

import type { LTRRanker } from "../../ltr/ranking/ltr.ranker.js";

import type { FeedbackDrivenReranker } from "../../ltr/feedback/feedback-driven.reranker.js";

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
  ) {}

  async retrieve(request: RetrievalRequest): Promise<RetrievalPipelineResult> {
    const start = Date.now();

    const profiler = new Profiler();

    // 1. Hybrid Retrieval

    const candidates = await profiler.trace("Hybrid Retrieval", () =>
      this.hybridRetriever.search(request.query),
    );

    // 2. LTR Ranking

    const ltrRanked = await profiler.trace("LTR Ranking", () =>
      Promise.resolve(this.ltrRanker.rank(request.query, candidates)),
    );

    // 3. Feedback Driven Reranking

    const feedbackRanked = await profiler.trace("Feedback Reranking", () =>
      this.feedbackReranker
        ? this.feedbackReranker.rerank(request.query, ltrRanked)
        : Promise.resolve(
            ltrRanked.map((item) => ({
              result: item.result,
              score: item.score,
              feedbackBoost: 0,
            })),
          ),
    );

    // Adaptación al formato actual

    const ltrCandidates = feedbackRanked.map(({ result, score }) => ({
      ...result,
      score,
    }));

    // 4. Reranking

    const ranked = await profiler.trace("Reranking", () =>
      this.reranker.rerank(request.query, ltrCandidates),
    );

    // 4. Quality scoring

    const qualityRanked = await profiler.trace("Quality Scoring", () =>
      this.qualityScoring.score(ranked),
    );

    // 5. Duplicate detection

    const unique = await profiler.trace("Duplicate Detection", () =>
      this.duplicateDetector.removeDuplicates(qualityRanked),
    );

    // 6. Diversity

    let finalResults = await profiler.trace("Diversity Filtering", () =>
      this.diversityService.filter(unique.results, request.limit ?? 5),
    );

    // Feedback collection

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
    if (values.length === 0) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
