import { KeywordIndex } from "../index/keyword.index.js";
import { MemoryRepository } from "../../memory/memory.repository.js";
import { BM25Ranker } from "../bm25/bm25.ranker.js";
import type { RetrievalResult } from "../types.js";

export class KeywordRetriever {
  constructor(
    private index: KeywordIndex,
    private repository: MemoryRepository,
  ) {}

  async search(query: string): Promise<RetrievalResult[]> {
    const ids = this.index.search(query);

    const memories = await this.repository.getAll();

    const ranker = new BM25Ranker(this.index);

    return memories
      .filter((m) => m.id && ids.includes(m.id))
      .map((memory) => ({
        memory,
        score: ranker.score(query, memory),
        source: "keyword" as const,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
