import type { FeatureVector } from "../features/feature.types.js";

export interface TrainingExample {
  features: FeatureVector;
  target: number;
}

export interface TrainerOptions {
  learningRate?: number;
}
