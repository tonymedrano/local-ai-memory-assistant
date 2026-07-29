import type { Memory } from "../memory/memory.types.js";

export interface RetrievalResult {
  memory: Memory;
  score: number;
  source: "vector" | "keyword" | "graph";
}
