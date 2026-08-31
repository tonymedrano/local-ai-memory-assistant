import type { FeatureVector } from "../features/feature.types.js";
import type { FeatureWeights } from "../model/feature-weights.js";

export class GradientOptimizer {
  static updateWeights(
    weights: FeatureWeights,
    features: FeatureVector,
    error: number,
    learningRate: number,
  ): FeatureWeights {
    const updated: FeatureWeights = { ...weights };

    for (const key of Object.keys(weights) as Array<keyof FeatureWeights>) {
      const featureValue = features[key] ?? 0;

      updated[key] = weights[key]! + learningRate * error * featureValue;
    }

    return updated;
  }
}
