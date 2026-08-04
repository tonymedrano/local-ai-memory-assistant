import { FeedbackType, type RankingFeedback } from "./feedback.types.js";
import { FeedbackRepository } from "./feedback.repository.js";

export class FeedbackService {
  constructor(
    private readonly repository: FeedbackRepository,
  ) {}

  record(
    input: Omit<RankingFeedback, "id" | "createdAt" | "signal">,
  ) {
    return this.repository.save({
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
    }
  }
}