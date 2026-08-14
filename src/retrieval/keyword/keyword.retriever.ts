import { KeywordIndex } from "../index/keyword.index.js";
import { MemoryRepository } from "../../memory/memory.repository.js";
import { BM25Ranker } from "../bm25/bm25.ranker.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export class KeywordRetriever {
  constructor(
    private index: KeywordIndex,
    private repository: MemoryRepository,
  ) {}

  async search(
    query: string,
    options?: {
      project?: string;
      type?: string;
    },
  ): Promise<RetrievalResult[]> {
    const ids = this.index.search(query);

    const memories = await this.repository.getAll();

    const ranker = new BM25Ranker(this.index);

    return memories
      .filter((m) => m.id && ids.includes(m.id))
      .filter((memory) => {
        if (options?.project && memory.project !== options.project) {
          return false;
        }

        if (options?.type && memory.type !== options.type) {
          return false;
        }

        if (memory.archived === true) {
          return false;
        }

        return true;
      })
      .map((memory) => ({
        memory,
        score: ranker.score(query, memory),
        source: "keyword" as const,
      }))
      .sort((a, b) => b.score - a.score);
  }
}
