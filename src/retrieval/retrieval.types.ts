import type { RankedResult } from "./reranker.types.js";
import type { TraceResult } from "../profiling/profiling.types.js";

export interface RetrievalRequest {
  query: string;
  project?: string;
  limit?: number;
}

export interface RetrievalPipelineResult {
  memories: RankedResult[];
  elapsedMs: number;
  trace?: TraceResult;
  quality?: RetrievalQualitySummary;
}

export interface RetrievalQualitySummary {
  averageScore: number;
  averageRelevance: number;
  averageConfidence: number;
  duplicatesRemoved?: number;
}

export type RetrievalSource =
  | "vector"
  | "keyword"
  | "graph"
  | "graph-evidence"
  | "hybrid";
