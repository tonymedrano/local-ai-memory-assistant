import type { DerivedKnowledge } from "./inference.types.js";

import { inferenceStorage } from "./inference.storage.js";

class InferenceRepository {
  private knowledge: DerivedKnowledge[];

  constructor() {
    this.knowledge = inferenceStorage.load();

    console.log(
      "[InferenceRepository] Loaded",
      this.knowledge.length,
      "derived knowledge",
    );
  }

  getAll() {
    return this.knowledge;
  }

  add(items: DerivedKnowledge[]) {
    for (const item of items) {
      const existing = this.knowledge.find(
        (current) =>
          current.subject === item.subject &&
          current.relation === item.relation &&
          current.object === item.object,
      );

      if (existing) {
        existing.confidence = Math.max(existing.confidence, item.confidence);

        existing.source = [...new Set([...existing.source, ...item.source])];

        continue;
      }

      this.knowledge.push(item);
    }

    inferenceStorage.save(this.knowledge);
  }

  find(subject: string, relation?: string) {
    return this.knowledge.filter(
      (item) =>
        item.subject === subject && (!relation || item.relation === relation),
    );
  }

  clear() {
    this.knowledge = [];

    inferenceStorage.save(this.knowledge);
  }
}

export const inferenceRepository = new InferenceRepository();
