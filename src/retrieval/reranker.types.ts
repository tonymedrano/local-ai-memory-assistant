import type { RetrievalResult } from "./types.js";

export interface RankedResult extends RetrievalResult {
  rerankScore: number;
}

export interface Reranker {
  rerank(
    query: string,
    candidates: RetrievalResult[],
  ): Promise<RankedResult[]>;
}