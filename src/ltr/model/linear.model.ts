import type { FeatureVector } from "../features/feature.types.js";
import type { LinearWeights } from "./model.types.js";

export class LinearModel {
  constructor(private weights: LinearWeights) {}

  predict(features: FeatureVector): number {
    return (Object.keys(this.weights) as Array<keyof LinearWeights>).reduce(
      (score, key) => {
        return score + this.weights[key]! * features[key]!;
      },
      0,
    );
  }

  getWeights(): LinearWeights {
    return {
      ...this.weights,
    };
  }

  setWeights(weights: LinearWeights): void {
    this.weights = {
      ...weights,
    };
  }
}
