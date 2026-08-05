import { LinearModel } from "../model/linear.model.js";
import { ModelRepository } from "../model/model.repository.js";
import { Trainer } from "./trainer.js";

import type { FeedbackRepository } from "../feedback/feedback.repository.js";
import { DEFAULT_WEIGHTS } from "../model/default-weights.js";

export class TrainingService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly modelRepository: ModelRepository,
  ) {}

  async train(): Promise<void> {
    const feedback = await this.feedbackRepository.findAll();

    const MIN_SAMPLES = 10;

    if (feedback.length < MIN_SAMPLES) {
      console.log(
        `[LTR] Not enough feedback samples: ${feedback.length}/${MIN_SAMPLES}`,
      );

      return;
    }

    const stored = this.modelRepository.load();

    const model = new LinearModel(stored?.weights ?? DEFAULT_WEIGHTS);

    const trainer = new Trainer(model);

    for (const item of feedback) {
      trainer.train({
        features: item.features,
        target: item.signal,
      });
    }

    this.modelRepository.save({
      version: stored?.version ?? 1,

      trainedAt: new Date().toISOString(),

      samples: (stored?.samples ?? 0) + feedback.length,

      weights: model.getWeights(),
    });
  }
}
