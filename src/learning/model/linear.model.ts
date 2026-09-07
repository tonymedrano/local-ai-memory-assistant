// src/learning/model/linear.model.ts

import type { FeatureVector } from "../features/feature.types.js";

export interface LinearWeights {
  semantic: number;
  bm25: number;
  importance: number;
  confidence: number;
  freshness: number;
  graphEvidence: number;
  accessCount: number;
  diversity: number;
  duplicatePenalty: number;
}

export class LinearModel {
  constructor(private readonly weights: LinearWeights) {}

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
}
