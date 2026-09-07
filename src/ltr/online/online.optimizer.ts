import type { FeatureVector } from "../features/feature.types.js";
import type { LinearWeights, StoredModel } from "../model/model.types.js";
import { GradientOptimizer } from "./gradient.optimizer.js";
import { LearningRate } from "./online.learning-rate.js";

export class OnlineOptimizer {
  constructor(
    private readonly learningRate: LearningRate,
    private readonly errorThreshold = 0.01,
    private readonly minWeight = -5,
    private readonly maxWeight = 5,
  ) {}

  update(
    model: StoredModel,
    features: FeatureVector,
    target: number,
    step: number,
  ): StoredModel {
    const prediction = this.predict(model.weights, features);
    const error = target - prediction;

    if (Math.abs(error) < this.errorThreshold) {
      return model;
    }

    const lr = this.learningRate.get(step);

    const weights = GradientOptimizer.updateWeights(
      model.weights,
      features,
      error,
      lr,
    );

    return {
      ...model,
      weights,
    };
  }

  private predict(weights: LinearWeights, features: FeatureVector): number {
    let score = 0;

    (Object.keys(weights) as Array<keyof LinearWeights>).forEach((key) => {
      score += weights[key] * (features[key] ?? 0);
    });

    return this.clampPrediction(score);
  }

  private clamp(value: number): number {
    return Math.max(this.minWeight, Math.min(this.maxWeight, value));
  }

  private clampPrediction(score: number): number {
    return Math.max(0, Math.min(1, score));
  }
}
