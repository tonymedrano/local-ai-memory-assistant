import type { RankedResult } from "./reranker.types.js";

export interface RetrievalRequest {
  query: string;
  project?: string;
  limit?: number;
}

export interface RetrievalPipelineResult {
  memories: RankedResult[];
  elapsedMs: number;
}