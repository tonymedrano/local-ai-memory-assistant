import type { LTRModel, LTRWeights, LTRFeatures } from "./ltr.model.js";


export class LinearLTRModel implements LTRModel {
  constructor(private weights: LTRWeights) {}

  predict(features: LTRFeatures): number {
    return (
      features.semantic * this.weights.semantic +
      features.bm25 * this.weights.bm25 +
      features.importance * this.weights.importance
    );
  }

  getWeights(): LTRWeights {
    return {
      ...this.weights,
    };
  }
}
