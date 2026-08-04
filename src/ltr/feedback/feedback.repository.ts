import { randomUUID } from "crypto";

import type { RankingFeedback } from "./feedback.types.js";

export class FeedbackRepository {
  private items: RankingFeedback[] = [];

  save(feedback: Omit<RankingFeedback, "id" | "createdAt">): RankingFeedback {
    const item: RankingFeedback = {
      id: randomUUID(),
      ...feedback,
      createdAt: new Date(),
    };

    this.items.push(item);

    return item;
  }

  findAll(): RankingFeedback[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
  }

  count(): number {
    return this.items.length;
  }
}
