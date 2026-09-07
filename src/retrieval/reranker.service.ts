import type { Reranker, RankedResult } from "./reranker.types.js";
import type { RetrievalResult } from "../retrieval/retrieval.types.js";

export class MockReranker implements Reranker {
  async rerank(
    query: string,
    candidates: RetrievalResult[],
  ): Promise<RankedResult[]> {
    return candidates
      .map(candidate => ({
        ...candidate,
        rerankScore: Math.random(),
      }))
      .sort((a, b) => b.rerankScore - a.rerankScore);
  }
}