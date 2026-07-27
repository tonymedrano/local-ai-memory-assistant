import type { KnowledgeItem } from "./knowledge.types.js";

import { knowledgeStorage } from "./knowledge.storage.js";

export class KnowledgeRepository {
  private items: KnowledgeItem[];

  constructor() {
    this.items = knowledgeStorage.load();

    console.log(
      `[KnowledgeRepository] Loaded ${this.items.length} knowledge items`,
    );
  }

  async save(knowledge: KnowledgeItem): Promise<KnowledgeItem> {
    const item = {
      ...knowledge,

      id: crypto.randomUUID(),
    };

    this.items.push(item);

    knowledgeStorage.save(this.items);

    return item;
  }

  async findAll(): Promise<KnowledgeItem[]> {
    return this.items;
  }

  async findBySubject(subject: string) {
    return this.items.filter((item) =>
      item.subject.toLowerCase().includes(subject.toLowerCase()),
    );
  }

  async replaceAll(items: KnowledgeItem[]) {
    this.items = items;

    knowledgeStorage.save(this.items);
  }

  async update(
    id: string,
    changes: Partial<KnowledgeItem>,
  ): Promise<KnowledgeItem | null> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const updated = {
      ...this.items[index],
      ...changes,
      id,
    };

    this.items[index] = updated;

    knowledgeStorage.save(this.items);

    return updated;
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id);

    knowledgeStorage.save(this.items);
  }
}
