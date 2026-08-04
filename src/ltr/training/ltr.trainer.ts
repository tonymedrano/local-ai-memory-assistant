import type { TrainingSample } from "./dataset.loader.js";
import type { LTRWeights } from "./ltr.model.js";


export class LTRTrainer {
  constructor(
    private learningRate: number = 0.05,
    private epochs: number = 50,
  ) {}

  train(samples: TrainingSample[]): LTRWeights {
    let weights: LTRWeights = {
      semantic: 0.5,

      bm25: 0.3,

      importance: 0.2,
    };

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (const sample of samples) {
        const prediction =
          sample.features.semantic * weights.semantic +
          sample.features.bm25 * weights.bm25 +
          sample.features.importance * weights.importance;

        const error = sample.label - prediction;

        weights.semantic +=
          this.learningRate * error * sample.features.semantic;

        weights.bm25 += this.learningRate * error * sample.features.bm25;

        weights.importance +=
          this.learningRate * error * sample.features.importance;
      }

      this.normalize(weights);
    }

    return weights;
  }

  private normalize(weights: LTRWeights) {
    const sum = weights.semantic + weights.bm25 + weights.importance;

    weights.semantic /= sum;

    weights.bm25 /= sum;

    weights.importance /= sum;
  }
}
