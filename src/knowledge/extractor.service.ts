import type { KnowledgeItem } from "./knowledge.types.js";

export class KnowledgeExtractor {
  async extract(memory: string): Promise<KnowledgeItem> {
    return {
      type: "fact",

      subject: "unknown",

      content: memory,

      relations: [],

      confidence: 0.5,

      createdAt: new Date(),
    };
  }
}
