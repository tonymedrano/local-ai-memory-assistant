import { KnowledgeExtractor } from "./extractor.service.js";

import { KnowledgeRepository } from "./knowledge.repository.js";
import type { Memory } from "../memory/memory.types.js";

export class KnowledgeService {
  constructor(
    private extractor = new KnowledgeExtractor(),
    private repository = new KnowledgeRepository(),
  ) {}

  async processMemory(memory: Pick<Memory, "text" | "tenantId">) {
    const knowledge = await this.extractor.extract(memory);

    return this.repository.save(knowledge);
  }

  async getKnowledge() {
    return this.repository.findAll();
  }

  async searchKnowledge(subject: string) {
    return this.repository.findBySubject(subject);
  }
}
