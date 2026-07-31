import { HybridRetriever } from "../hybrid/hybrid.retriever.js";

import type { Reranker } from "../reranker.types.js";

import type {
  RetrievalRequest,
  RetrievalPipelineResult,
} from "../retrieval.types.js";

export class RetrievalPipeline {
  constructor(
    private readonly hybridRetriever: HybridRetriever,
    private readonly reranker: Reranker,
  ) {}

  async retrieve(
    request: RetrievalRequest,
  ): Promise<RetrievalPipelineResult> {
    const start = Date.now();

    // Hybrid Retrieval (Vector + Keyword + RRF)
    const candidates = await this.hybridRetriever.search(request.query);

    // Reranking
    const ranked = await this.reranker.rerank(
      request.query,
      candidates,
    );

    return {
      memories: ranked.slice(
        0,
        request.limit ?? 5,
      ),
      elapsedMs: Date.now() - start,
    };
  }
}