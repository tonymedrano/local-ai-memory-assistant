import type { RankedResult } from "./reranker.types.js";
import type { TraceResult } from "../profiling/profiling.types.js";
import type { Memory, MemoryType } from "../memory/memory.types.js";
import type { RetrievalStrategy } from "./intelligence/strategy.types.js";

export interface RetrievalRequest {
  query: string;
  limit?: number;
  options?: RetrievalOptions;
}

export interface RetrievalOptions {
  useLTR?: boolean;
  useFeedback?: boolean;
  strategy?: RetrievalStrategy;
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

export interface RetrievalResult {
  memory: Memory;
  score: number;
  source: RetrievalSource;
  semanticScore?: number;
  keywordScore?: number;
  graphScore?: number;
  diversityScore?: number;
  duplicatePenalty?: number;
}

export interface RetrievalRequest {
  query: string;
  limit?: number;
  options?: RetrievalOptions;
}

export interface RetrievalOptions {
  project?: string;
  type?: MemoryType;

  useLTR?: boolean;
  useFeedback?: boolean;

  strategy?: RetrievalStrategy;
}