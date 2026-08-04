import type { RetrievalResult } from "./types.js";

export interface RankedResult extends RetrievalResult {
  rerankScore: number;
}

export interface Reranker {
  rerank(query: string, candidates: RetrievalResult[]): Promise<RankedResult[]>;
}

export interface RetrievalRequest {
  query: string;

  project?: string;

  limit?: number;
}

export interface RetrievalPipelineResult {
  memories: RankedResult[];
  elapsedMs: number;
  quality?: RetrievalQualitySummary;
}

export interface RetrievalQualitySummary {
  averageScore: number;
  averageRelevance: number;
  averageConfidence: number;

  /**
   * Number of memories removed
   * because they were duplicates
   */
  duplicatesRemoved?: number;
}
