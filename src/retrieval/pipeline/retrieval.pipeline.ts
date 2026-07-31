import { HybridRetriever } from "../hybrid/hybrid.retriever.js";

import type { Reranker } from "../reranker.types.js";

import { QualityScoringService } from "../quality/quality.service.js";
import { DiversityService } from "../quality/diversity.service.js";

import type {
  RetrievalRequest,
  RetrievalPipelineResult,
} from "../retrieval.types.js";

export class RetrievalPipeline {
  constructor(
    private readonly hybridRetriever: HybridRetriever,
    private readonly reranker: Reranker,
    private readonly qualityScoring: QualityScoringService,
    private readonly diversityService: DiversityService,
  ) {}

  async retrieve(request: RetrievalRequest): Promise<RetrievalPipelineResult> {
    const start = Date.now();

    // Hybrid Retrieval
    const candidates = await this.hybridRetriever.search(request.query);

    // Reranking
    const ranked = await this.reranker.rerank(request.query, candidates);

    // Quality scoring
    const qualityRanked = await this.qualityScoring.score(ranked);

    // Diversity filtering
    const diverse = await this.diversityService.filter(
      qualityRanked,
      request.limit ?? 5,
    );

    return {
      memories: diverse,

      elapsedMs: Date.now() - start,

      quality: {
        averageScore: this.average(
          diverse.map((item) => item.qualityScore.finalScore),
        ),

        averageRelevance: this.average(
          diverse.map((item) => item.qualityScore.relevance),
        ),

        averageConfidence: this.average(
          diverse.map((item) => item.qualityScore.confidence),
        ),
      },
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;

    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
