import { FeedbackService } from "../feedback/feedback.service.js";

const feedbackService = new FeedbackService();

export class FeedbackBooster {
  getScore(memoryId: string): number {
    return feedbackService.calculateScore(memoryId);
  }

  boost(baseScore: number, memoryId: string): number {
    const feedback = this.getScore(memoryId);
    return baseScore + feedback * 0.2;
  }
}
