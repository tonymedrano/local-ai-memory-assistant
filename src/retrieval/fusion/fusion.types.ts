import type { RetrievalResult } from "../types.js";

export interface FusionSignals {
  rrf: number;
  source: number;
  confidence: number;
  evidence: number;
  semantic: number;
}

export interface FusionResult extends RetrievalResult {
  signals: FusionSignals;
}