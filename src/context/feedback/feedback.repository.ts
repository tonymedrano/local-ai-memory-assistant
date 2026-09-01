import { randomUUID } from "node:crypto";

import type { ContextFeedback } from "./feedback.types.js";

export class FeedbackRepository {
  private feedbacks: ContextFeedback[] = [];

  save(feedback: ContextFeedback): ContextFeedback {
    const item: ContextFeedback = {
      ...feedback,
      id: randomUUID(),
      createdAt: feedback.createdAt ?? new Date(),
    };

    this.feedbacks.push(item);

    return item;
  }

  getAll(): ContextFeedback[] {
    return this.feedbacks;
  }

  findByMemory(tenantId: string, memoryId: string): ContextFeedback[] {
    return this.feedbacks.filter((feedback) =>
      feedback.tenantId === tenantId && feedback.memories.includes(memoryId),
    );
  }
}
