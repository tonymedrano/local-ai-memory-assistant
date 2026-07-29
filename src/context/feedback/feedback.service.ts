import { FeedbackRepository } from "./feedback.repository.js";
import type { ContextFeedback } from "./feedback.types.js";

import { memoryRepository } from "../../memory/memory.repository.instance.js";

const repository = new FeedbackRepository();

export class FeedbackService {
  create(feedback: ContextFeedback) {
    return repository.save(feedback);
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
