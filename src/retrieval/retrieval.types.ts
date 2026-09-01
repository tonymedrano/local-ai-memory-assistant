import type { Memory, MemoryType } from "../memory/memory.types.js";
import type { TraceResult } from "../profiling/profiling.types.js";
import type { RankedResult } from "./reranker.types.js";
import type { RetrievalStrategy } from "./strategy/retrieval.strategy.js";
import type { ContextModel } from "../context/model/context.model.js";

export interface RetrievalRequest {
  query: string;

  limit?: number;

  /**
   * Optional contextual information used to
   * influence retrieval strategy and candidate budgeting.
   *
   * Context is input data for retrieval, not execution
   * configuration, so it lives directly on the request.
   */
  context?: ContextModel;

  options?: RetrievalOptions;
}

export interface RetrievalOptions {
  /** Internal tenant scope, set by the trusted HTTP boundary. */
  tenantId?: string;
  project?: string;
  type?: MemoryType;

  useLTR?: boolean;
  useFeedback?: boolean;

  /**
   * Optional explicit strategy.
   *
   * Normally the RetrievalPipeline derives the strategy
   * automatically from the QueryProfile.
   *
   * This remains available for evaluation/benchmarking
   * and controlled experiments.
   */
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

  originalSources?: RetrievalSource[];
}
