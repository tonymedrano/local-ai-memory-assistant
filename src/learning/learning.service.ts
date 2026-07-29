import { randomUUID } from "crypto";

import { LearningRepository } from "./learning.repository.js";
import { type ContextLearning, LearningEventType } from "./learning.types.js";
import { type LearningEvent } from "./learning.events.js";

export class LearningService {
  constructor(private repository: LearningRepository) {}

  private normalizeScore(score: number) {
    return Math.max(0, Math.min(1, score));
  }

  recordEvent(event: LearningEvent) {
    const weight = this.calculateWeight(event.event);

    const learning: ContextLearning = {
      id: randomUUID(),
      memoryId: event.memoryId,
      event: event.event,
      query: event.query,
      scoreBefore: event.currentScore,
      scoreAfter: this.normalizeScore(event.currentScore + weight),
      weight,
      createdAt: new Date(),
    };

    this.repository.save(learning);

    return learning;
  }

  private calculateWeight(event: LearningEventType) {
    switch (event) {
      case LearningEventType.CONTEXT_USED:
        return 0.1;

      case LearningEventType.ANSWER_ACCEPTED:
        return 0.2;

      case LearningEventType.CONTEXT_IGNORED:
        return -0.05;

      case LearningEventType.ANSWER_REJECTED:
        return -0.2;

      case LearningEventType.USER_CORRECTION:
        return -0.15;

      default:
        return 0;
    }
  }

  calculateLearningScore(memoryId: string) {
    const events = this.repository.findByMemory(memoryId);

    if (events.length === 0) return 0;

    const total = events.reduce((sum, e) => sum + e.weight, 0);

    return Math.max(-1, Math.min(1, total));
  }

  getLearningScore(memoryId: string) {
    return this.calculateLearningScore(memoryId);
  }

  getEvents(memoryId: string) {
    return this.repository.findByMemory(memoryId);
  }
}
