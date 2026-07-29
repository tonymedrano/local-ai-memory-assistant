import { KeywordIndex } from "../index/keyword.index.js";
import { MemoryRepository } from "../../memory/memory.repository.js";
import type { RetrievalResult } from "../types.js";

export class KeywordRetriever {
  constructor(
    private index: KeywordIndex,
    private repository: MemoryRepository,
  ) {}

  async search(query: string): Promise<RetrievalResult[]> {
    const ids = this.index.search(query);

    const memories = await this.repository.getAll();

    return memories
      .filter((m) => m.id && ids.includes(m.id))
      .map((memory) => ({
        memory,
        score: 1,
        source: "keyword" as const,
      }));
  }
}
