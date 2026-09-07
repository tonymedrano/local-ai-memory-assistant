import { FeedbackRepository } from "./feedback.repository.js";
import type { ContextFeedback } from "./feedback.types.js";

import { memoryRepository as productionMemoryRepository } from "../../memory/memory.repository.instance.js";

export class FeedbackService {
  constructor(private readonly repository = new FeedbackRepository(), private readonly memoryRepository: Pick<typeof productionMemoryRepository, "findById" | "update"> = productionMemoryRepository) {}
  async create(tenantId: string, feedback: Omit<ContextFeedback, "tenantId">) {
    for (const memoryId of feedback.memories) {
      if (!await this.memoryRepository.findById(memoryId, tenantId)) {
        throw new Error("Memory not found for tenant");
      }
    }
    const saved = await this.repository.save({ ...feedback, tenantId });
    return saved;
  }

  getAll() {
    return this.repository.getAll();
  }

  getMemoryFeedback(tenantId: string, memoryId: string) {
    return this.repository.findByMemory(tenantId, memoryId);
  }

  calculateScore(tenantId: string, memoryId: string) {
    const feedback = this.getMemoryFeedback(tenantId, memoryId);

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

  async applyFeedback(tenantId: string, memoryId: string) {
    const score = this.calculateScore(tenantId, memoryId);

    if (score === 0) {
      return null;
    }

    const memory = await this.memoryRepository.findById(memoryId, tenantId);

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

    await this.memoryRepository.update(memoryId, {
      importance: newImportance,

      updatedAt: new Date().toISOString(),
    }, tenantId);

    return {
      memoryId,

      previous: currentImportance,

      updated: newImportance,

      score,
    };
  }
}
