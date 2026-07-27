import type { KnowledgeItem } from "./knowledge.types.js";

export interface ConsolidatedKnowledge {
  type: KnowledgeItem["type"];

  subject: string;

  content: string;

  relations: KnowledgeItem["relations"];

  confidence: number;
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
    const first = items[0];

    const contents = items
      .map((item) => item.content)
      .filter((value, index, array) => array.indexOf(value) === index);

    const relations = items.flatMap((item) => item.relations);

    const confidence = Math.min(
      1,
      Number(
        (
          items.reduce((sum, item) => sum + item.confidence, 0) / items.length +
          0.1
        ).toFixed(2),
      ),
    );

    return {
      type: first.type,

      subject: first.subject,

      content: contents.join(". "),

      relations,

      confidence,
    };
  }
}
