import type { RankedResult } from "./reranker.types.js";

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
  duplicatesRemoved?: number;
}
