import type { KnowledgeItem } from "./knowledge.types.js";

export interface ConsolidatedKnowledge {
  id: string;

  type: KnowledgeItem["type"];

  subject: string;

  content: string;

  relations: KnowledgeItem["relations"];

  confidence: number;

  createdAt: Date;
}

export class KnowledgeConsolidator {
  consolidate(items: KnowledgeItem[]): ConsolidatedKnowledge[] {
    const groups = new Map<string, KnowledgeItem[]>();

    for (const item of items) {
      const key = `${item.type}:${item.subject.toLowerCase()}`;

      const group = groups.get(key) ?? [];

      group.push(item);

      groups.set(key, group);
    }

    return Array.from(groups.values()).map((group) => this.merge(group));
  }

  private merge(items: KnowledgeItem[]): ConsolidatedKnowledge {
    const best = items.reduce((current, item) =>
      item.confidence > current.confidence ? item : current,
    );

    const contents = items
      .map((item) => item.content)
      .filter((value, index, array) => array.indexOf(value) === index);

    const relations = items.flatMap((item) => item.relations);

    const confidence = Number(
      Math.min(
        1,
        Math.max(...items.map((item) => item.confidence)) + 0.05,
      ).toFixed(2),
    );

    const createdAt = items.reduce(
      (oldest, item) => (item.createdAt < oldest ? item.createdAt : oldest),
      best.createdAt,
    );

    return {
      id: best.id ?? crypto.randomUUID(),
      type: best.type,
      subject: best.subject,
      content: contents.join(". "),
      relations,
      confidence,
      createdAt,
    };
  }
}
