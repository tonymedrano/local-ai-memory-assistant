import { LinearModel } from "../model/linear.model.js";
import type { LinearWeights } from "../model/model.types.js";

import type { TrainerOptions, TrainingExample } from "./trainer.types.js";

export class Trainer {
  private readonly learningRate: number;

  constructor(
    private readonly model: LinearModel,
    options: TrainerOptions = {},
  ) {
    this.learningRate = options.learningRate ?? 0.05;
  }

  train(example: TrainingExample): void {
    const prediction = this.model.predict(example.features);

    const error = example.target - prediction;

    const weights = this.model.getWeights();

    const updated = {
      ...weights,
    };

    for (const key of Object.keys(weights) as Array<keyof LinearWeights>) {
      const weight = weights[key];
      const feature = example.features[key] ?? 0;

      updated[key] = weight + this.learningRate * error * feature;
    }

    this.model.setWeights(updated);
  }
}
