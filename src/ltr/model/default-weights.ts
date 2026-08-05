import type { LinearWeights } from "./model.types.js";

export const DEFAULT_WEIGHTS: LinearWeights = {
  semantic: 0.35,
  bm25: 0.20,
  importance: 0.15,
  confidence: 0.10,
  freshness: 0.10,
  graphEvidence: 0.05,
  accessCount: 0.03,
  diversity: 0.02,
  duplicatePenalty: -0.10,

  feedbackScore: 0.05,
  retrievalFrequency: 0.03,
  ageScore: 0.02,
};