// src/learning/trainer/trainer.ts

import type {
  FeatureVector,
  TrainingExample,
} from "../features/feature.types.js";
import type { LinearWeights } from "../model/model.types.js";
import type { TrainingResult } from "./trainer.types.js";

export class Trainer {
  train(
    dataset: TrainingExample[],
    iterations = 500,
    learningRate = 0.05,
  ): TrainingResult {
    if (dataset.length === 0) {
      return {
        weights: this.createWeights(),
        iterations: 0,
        loss: 0,
        samples: 0,
      };
    }

    const weights = this.createWeights();

    let loss = 0;

    for (let i = 0; i < iterations; i++) {
      loss = 0;

      for (const sample of dataset) {
        const x = sample.features;

        const prediction = this.predict(x, weights);

        const error = sample.label - prediction;

        loss += error * error;

        weights.semantic += learningRate * error * x.semantic;
        weights.bm25 += learningRate * error * x.bm25;
        weights.importance += learningRate * error * x.importance;
        weights.confidence += learningRate * error * x.confidence;
        weights.freshness += learningRate * error * x.freshness;
        weights.graphEvidence += learningRate * error * x.graphEvidence;
        weights.accessCount += learningRate * error * x.accessCount;
        weights.diversity += learningRate * error * x.diversity;
        weights.duplicatePenalty +=
          learningRate * error * x.duplicatePenalty;
      }

      loss /= dataset.length;
    }

    return {
      weights,
      iterations,
      loss,
      samples: dataset.length,
    };
  }

  private predict(
    features: FeatureVector,
    weights: LinearWeights,
  ): number {
    return (
      features.semantic * weights.semantic +
      features.bm25 * weights.bm25 +
      features.importance * weights.importance +
      features.confidence * weights.confidence +
      features.freshness * weights.freshness +
      features.graphEvidence * weights.graphEvidence +
      features.accessCount * weights.accessCount +
      features.diversity * weights.diversity +
      features.duplicatePenalty * weights.duplicatePenalty
    );
  }

  private createWeights(): LinearWeights {
    return {
      semantic: 0,
      bm25: 0,
      importance: 0,
      confidence: 0,
      freshness: 0,
      graphEvidence: 0,
      accessCount: 0,
      diversity: 0,
      duplicatePenalty: 0,
    };
  }
}