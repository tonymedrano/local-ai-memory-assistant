import type { KnowledgeItem } from "./knowledge.types.js";

export class KnowledgeRepository {
  private items: KnowledgeItem[] = [];

  async save(knowledge: KnowledgeItem): Promise<KnowledgeItem> {
    const item = {
      ...knowledge,
      id: crypto.randomUUID(),
    };

    this.items.push(item);

    return item;
  }

  async findAll(): Promise<KnowledgeItem[]> {
    return this.items;
  }

  async findBySubject(subject: string): Promise<KnowledgeItem[]> {
    return this.items.filter((item) =>
      item.subject.toLowerCase().includes(subject.toLowerCase()),
    );
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
