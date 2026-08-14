import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export interface UnifiedResult {
  results: RetrievalResult[];

  sources: {
    memory: number;
    knowledge: number;
    inference: number;
  };
}
