import type { FeatureVector } from "../features/feature.types.js";
import type { LinearWeights } from "./model.types.js";

export class LinearModel {
  constructor(private weights: LinearWeights) {}

  predict(features: FeatureVector): number {
    return (Object.keys(this.weights) as Array<keyof LinearWeights>).reduce(
      (score, key) => {
        const featureValue = features[key] ?? 0;

        return score + this.weights[key]! * featureValue;
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
