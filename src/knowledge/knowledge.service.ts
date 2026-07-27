import { KnowledgeExtractor } from "./extractor.service.js";

import { KnowledgeRepository } from "./knowledge.repository.js";

export class KnowledgeService {
  constructor(
    private extractor = new KnowledgeExtractor(),
    private repository = new KnowledgeRepository(),
  ) {}

  async processMemory(memory: string) {
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
