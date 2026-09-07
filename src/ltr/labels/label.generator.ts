import {
  FeedbackType,
  type RankingFeedback,
} from "../feedback/feedback.types.js";
import type { TrainingLabel } from "./label.types.js";

export class LabelGenerator {
  generate(feedback: RankingFeedback): TrainingLabel {
    const features = feedback.features;

    return {
      query: feedback.query,
      memoryId: feedback.memoryId,

      semantic: features.semantic,
      bm25: features.bm25,
      importance: features.importance,
      confidence: features.confidence,
      freshness: features.freshness,
      graphEvidence: features.graphEvidence,
      accessCount: features.accessCount,
      diversity: features.diversity,
      duplicatePenalty: features.duplicatePenalty,

      label: this.score(feedback.type),
    };
  }

  private score(type: FeedbackType): number {
    switch (type) {
      case FeedbackType.ACCEPT:
        return 1;

      case FeedbackType.CLICK:
        return 0.8;

      case FeedbackType.REJECT:
        return 0;

      default:
        return 0.5;
    }
  }
}
