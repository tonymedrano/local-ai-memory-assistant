import { DatasetRepository } from "./dataset.repository.js";
import { FeedbackRepository } from "../feedback/feedback.repository.js";
import { FeatureStore } from "../features/feature.store.js";
import { FeedbackType } from "../feedback/feedback.types.js";

export class AutomaticDatasetBuilder {
  constructor(
    private readonly feedbackRepository = new FeedbackRepository(),
    private readonly featureStore = new FeatureStore(),
    private readonly datasetRepository = new DatasetRepository(),
  ) {}

  async build(): Promise<number> {
    const feedbacks = await this.feedbackRepository.findAll();

    let generated = 0;

    for (const feedback of feedbacks) {
      const features = this.featureStore.find(
        feedback.query,
        feedback.memoryId,
      );

      if (!features) {
        continue;
      }

      this.datasetRepository.upsert({
        query: feedback.query,
        memoryId: feedback.memoryId,
        features,
        label: this.labelFromFeedback(feedback.type),
        createdAt: new Date(),
      });

      generated++;
    }

    return generated;
  }

  private labelFromFeedback(type: FeedbackType): number {
    switch (type) {
      case FeedbackType.ACCEPT:
        return 1;

      case FeedbackType.CLICK:
        return 0.6;

      case FeedbackType.IGNORE:
        return 0.2;

      case FeedbackType.REJECT:
        return 0;

      default:
        return 0.5;
    }
  }
}
