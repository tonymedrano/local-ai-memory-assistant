import { FeedbackType, type RankingFeedback } from "./feedback.types.js";
import { FeedbackService } from "./feedback.service.js";
import { OnlineTrainingService } from "../online/online.training.service.js";
import type { FeedbackScope } from "./feedback.types.js";
export class FeedbackLearningService {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly onlineTraining: OnlineTrainingService
  ) {}

  async record(
    scope: FeedbackScope,
    input: Omit<RankingFeedback, "id" | "createdAt" | "signal" | "scope">
  ): Promise<void> {

    await this.feedbackService.record(scope, input);

    if (
      input.type !== FeedbackType.ACCEPT &&
      input.type !== FeedbackType.REJECT
    ) {
      return;
    }

    const label =
      input.type === FeedbackType.ACCEPT ? 1 : 0;

    await this.onlineTraining.learn(
      input.features,
      label
    );
  }
}
