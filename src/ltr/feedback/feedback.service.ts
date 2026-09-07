import { FeedbackType, type FeedbackScope, type RankingFeedback } from "./feedback.types.js";
import { FeedbackRepository } from "./feedback.repository.js";

export class FeedbackService {
  constructor(
    private readonly repository: FeedbackRepository
  ) {}

  record(
    scope: FeedbackScope,
    input: Omit<RankingFeedback, "id" | "createdAt" | "signal" | "scope">
  ) {
    return this.repository.save(scope, {
      ...input,
      signal: this.calculateSignal(input.type),
    });
  }

  private calculateSignal(type: FeedbackType): number {
    switch (type) {
      case FeedbackType.ACCEPT:
        return 1;

      case FeedbackType.CLICK:
        return 0.5;

      case FeedbackType.REJECT:
        return -1;

      case FeedbackType.IMPRESSION:
      case FeedbackType.IGNORE:
        return 0;

      default:
        return 0;
    }
  }
}
