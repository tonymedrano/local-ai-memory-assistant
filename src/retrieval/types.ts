import type { Memory } from "../memory/memory.types.js";

export type RetrievalSource = "vector" | "keyword" | "graph" | "graph-evidence"| "hybrid";

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