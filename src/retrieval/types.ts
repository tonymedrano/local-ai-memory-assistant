import type { Memory } from "../memory/memory.types.js";

export type RetrievalSource = "vector" | "keyword" | "graph" | "graph-evidence"| "hybrid";

export interface RetrievalResult {
  memory: Memory;
  score: number; 
  source: RetrievalSource;
  originalSources?: RetrievalSource[];
}