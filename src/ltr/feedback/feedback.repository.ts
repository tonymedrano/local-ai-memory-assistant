import type { Feedback } from './feedback.types.js';

export class FeedbackRepository {
  private feedbacks: Feedback[] = [];

  addFeedback(feedback: Feedback): void {
    this.feedbacks.push(feedback);
  }

  getFeedbackById(id: string): Feedback | undefined {
    return this.feedbacks.find(f => f.id === id);
  }

  // ... other methods ...

}