// src/learning/trainer/trainer.types.ts

import type { LinearWeights } from "../model/model.types.js";

export interface TrainingResult {
  weights: LinearWeights;

  iterations: number;

  loss: number;
  samples: number;
}
