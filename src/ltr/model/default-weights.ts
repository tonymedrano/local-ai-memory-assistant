import type { LinearWeights } from "./model.types.js";

export const DEFAULT_WEIGHTS: LinearWeights = {
  semantic: 0.35,
  bm25: 0.2,
  importance: 0.15,
  confidence: 0.1,
  freshness: 0.1,
  graphEvidence: 0.05,
  accessCount: 0.03,
  diversity: 0.02,
  duplicatePenalty: -0.1,

  feedbackScore: 0.05,
  retrievalFrequency: 0.03,
  ageScore: 0.02,
  contextScore: 0.15,
};
