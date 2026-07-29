import { KnowledgeRepository } from "../../knowledge/knowledge.repository.js";

export class KnowledgeProvider {
  private repository = new KnowledgeRepository();

  async search(_query: string) {
    return this.repository.findAll();
  }
}