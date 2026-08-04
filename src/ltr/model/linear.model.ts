import type { FeatureVector } from "../features/feature.types.js";
import type { LinearWeights } from "./model.types.js";

export class LinearModel {
  constructor(private weights: LinearWeights) {}

  predict(features: FeatureVector): number {
    return (
      features.semantic * this.weights.semantic +
      features.bm25 * this.weights.bm25 +
      features.importance * this.weights.importance +
      features.confidence * this.weights.confidence +
      features.freshness * this.weights.freshness +
      features.graphEvidence * this.weights.graphEvidence +
      features.accessCount * this.weights.accessCount +
      features.diversity * this.weights.diversity +
      features.duplicatePenalty * this.weights.duplicatePenalty
    );
  }

  getWeights() {
    return {
      ...this.weights,
    };
  }

  setWeights(weights: typeof this.weights) {
    this.weights = {
      ...weights,
    };
  }
}
