import { LinearModel } from "../model/linear.model.js";
import { ModelRepository } from "../model/model.repository.js";
import { Trainer } from "./trainer.js";

import type { FeedbackRepository } from "../feedback/feedback.repository.js";
import { isTrainableFeedback } from "../feedback/feedback.types.js";
import { DEFAULT_WEIGHTS } from "../model/default-weights.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";

export class TrainingService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly modelRepository: ModelRepository,
  ) {}

  async train(scope: FeedbackScope): Promise<void> {
    if (scope.kind !== "tenant") throw new Error("Training requires tenant scope");
    const feedback = await this.feedbackRepository.findAll(scope);
    const trainableFeedback = feedback.filter((item) =>
      isTrainableFeedback(item.type),
    );

    const MIN_SAMPLES = 10;

    if (trainableFeedback.length < MIN_SAMPLES) {
      console.log(
        `[LTR] Not enough trainable feedback samples: ${trainableFeedback.length}/${MIN_SAMPLES}`,
      );

      return;
    }

    const stored = this.modelRepository.loadScoped(scope);

    const model = new LinearModel(stored?.weights ?? DEFAULT_WEIGHTS);

    const trainer = new Trainer(model);

    for (const item of trainableFeedback) {
      trainer.train({
        features: item.features,
        target: item.signal,
      });
    }

    this.modelRepository.saveScoped(scope, {
      version: stored?.version ?? 1,

      trainedAt: new Date().toISOString(),

      samples: (stored?.samples ?? 0) + trainableFeedback.length,

      weights: model.getWeights(),
    });
  }
}
