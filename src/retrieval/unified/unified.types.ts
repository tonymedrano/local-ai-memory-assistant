import type { RetrievalResult } from "../types.js";

export interface UnifiedResult {
  results: RetrievalResult[];

  sources: {
    memory: number;
    knowledge: number;
    inference: number;
  };
}
