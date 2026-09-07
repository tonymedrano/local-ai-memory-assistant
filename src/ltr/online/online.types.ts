import type { FeatureVector } from "../features/feature.types.js";

export interface OnlineInteraction {
  query: string;
  memoryId: string;
  features: FeatureVector;
  predictedScore: number;
  reward: number;
  timestamp: Date;
}

export interface OnlineTrainingResult {
  error: number;
  previousWeights: Record<string, number>;
  updatedWeights: Record<string, number>;
}
