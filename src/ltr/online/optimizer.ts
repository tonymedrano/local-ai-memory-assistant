import type { FeatureVector } from "../features/feature.types.js";
import type { FeatureWeights } from "../model/feature-weights.js";

export interface Optimizer {
  updateWeight(
    currentWeight: number,
    featureValue: number,
    error: number,
    learningRate: number,
  ): number;

  updateWeights(
    weights: FeatureWeights,
    features: FeatureVector,
    error: number,
    learningRate: number,
  ): FeatureWeights;
}