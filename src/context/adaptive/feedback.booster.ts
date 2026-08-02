import { FeedbackService } from "../feedback/feedback.service.js";

const feedbackService = new FeedbackService();

export class FeedbackBooster {
  getScore(memoryId: string): number {
    return feedbackService.calculateScore(memoryId);
  }

  boost(baseScore: number, memoryId: string) {
    return baseScore + this.getScore(memoryId) * 0.2;
  }
}
