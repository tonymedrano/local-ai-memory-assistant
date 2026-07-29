import { KnowledgeRepository } from "../knowledge.repository.js";

import type { KnowledgeItem } from "../knowledge.types.js";

export type MutationAction = "boost" | "weaken" | "mark-uncertain";

export class KnowledgeMutation {
  constructor(private repository: KnowledgeRepository) {}

  async apply(
    id: string,
    action: MutationAction,
  ): Promise<KnowledgeItem | null> {
    const items = await this.repository.findAll();

    const knowledge = items.find((item) => item.id === id);

    if (!knowledge) {
      return null;
    }

    let confidence = knowledge.confidence;

    switch (action) {
      case "boost":
        confidence = Math.min(1, confidence + 0.1);

        break;

      case "weaken":
        confidence = Math.max(0, confidence - 0.2);

        break;

      case "mark-uncertain":
        confidence = 0.5;

        break;
    }

    return this.repository.update(id, {
      confidence,
    });
  }
}
