import type { FeatureVector } from "../features/feature.types.js";
import type { Optimizer } from "./optimizer.js";
import type { FeatureWeights } from "../model/feature-weights.js";

export interface GradientUpdate {
  currentWeight: number;
  featureValue: number;
  error: number;
}

export class GradientOptimizer implements Optimizer {
  constructor(private readonly learningRate: number = 0.01) {}

  /**
   * Actualiza un único peso utilizando descenso por gradiente.
   */
  updateWeight(
    currentWeight: number,
    featureValue: number,
    error: number,
  ): number {
    return currentWeight + this.learningRate * error * featureValue;
  }

  /**
   * Actualiza todos los pesos del modelo.
   */
  updateWeights(
    weights: FeatureWeights,
    features: FeatureVector,
    error: number,
  ): FeatureWeights {
    const updated: FeatureWeights = { ...weights };

    for (const key of Object.keys(weights) as (keyof FeatureVector)[]) {
      updated[key] = this.updateWeight(weights[key]!, features[key]!, error);
    }

    return updated;
  }
}
