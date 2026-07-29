import { FeedbackRepository } from "./feedback.repository.js";
import type { ContextFeedback } from "./feedback.types.js";

import { memoryRepository } from "../../memory/memory.repository.instance.js";
import { learningService } from "../../core/container.js";
import { LearningEventType } from "../../learning/learning.types.js";

const repository = new FeedbackRepository();

export class FeedbackService {
  async create(feedback: ContextFeedback) {
    const saved = await repository.save(feedback);

    for (const memoryId of feedback.memories) {
      const currentScore = 0;

      await learningService.recordEvent({
        memoryId,

        event:
          feedback.feedback === "positive"
            ? LearningEventType.ANSWER_ACCEPTED
            : LearningEventType.ANSWER_REJECTED,

        query: feedback.query,

        currentScore,
      });
    }

    return saved;
  }

  getAll() {
    return repository.getAll();
  }

  getMemoryFeedback(memoryId: string) {
    return repository.findByMemory(memoryId);
  }

  calculateScore(memoryId: string) {
    const feedback = this.getMemoryFeedback(memoryId);

    if (!feedback.length) {
      return 0;
    }

    let score = 0;

    for (const item of feedback) {
      if (item.feedback === "positive") {
        score += 1;
      }

      if (item.feedback === "negative") {
        score -= 1;
      }
    }

    return score / feedback.length;
  }

  async applyFeedback(memoryId: string) {
    const score = this.calculateScore(memoryId);

    if (score === 0) {
      return null;
    }

    const memories = await memoryRepository.getAll();

    const memory = memories.find((item) => item.id === memoryId);

    if (!memory) {
      return null;
    }

    const currentImportance = Number(memory.importance ?? 0.5);

    let newImportance = currentImportance;

    if (score > 0.5) {
      newImportance = Math.min(currentImportance + 0.05, 1);
    }

    if (score < -0.5) {
      newImportance = Math.max(currentImportance - 0.1, 0);
    }

    await memoryRepository.update(memoryId, {
      importance: newImportance,

      updatedAt: new Date().toISOString(),
    });

    return {
      memoryId,

      previous: currentImportance,

      updated: newImportance,

      score,
    };
  }
}
