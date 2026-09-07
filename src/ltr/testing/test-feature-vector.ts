import type { FeatureVector } from "../features/feature.types.js";

export function createTestFeatureVector(): FeatureVector {
  return {
    semantic: 0.80,
    bm25: 0.60,
    importance: 0.40,
    confidence: 0.90,
    freshness: 0.70,
    graphEvidence: 0.50,
    accessCount: 0.30,
    diversity: 0.60,
    duplicatePenalty: 0.10,

    feedbackScore: 0.90,
    retrievalFrequency: 0.50,
    ageScore: 0.40,
  };
}