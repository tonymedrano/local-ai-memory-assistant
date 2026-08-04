import { LinearModel } from "../model/linear.model.js";

import type {
  TrainerOptions,
  TrainingExample,
} from "./trainer.types.js";

export class Trainer {
  private readonly learningRate: number;

  constructor(
    private readonly model: LinearModel,
    options: TrainerOptions = {},
  ) {
    this.learningRate = options.learningRate ?? 0.05;
  }

  train(example: TrainingExample): void {
    const prediction =
      this.model.predict(example.features);

    const error =
      example.target - prediction;

    const weights = this.model.getWeights();

    const updated = {
      ...weights,
    };

    for (const key of Object.keys(
      weights,
    ) as (keyof typeof weights)[]) {
      updated[key] =
        weights[key] +
        this.learningRate *
          error *
          example.features[key];
    }

    this.model.setWeights(updated);
  }
}