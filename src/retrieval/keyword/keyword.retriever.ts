import { KeywordIndex } from "../index/keyword.index.js";
import { MemoryRepository } from "../../memory/memory.repository.js";
import { BM25Ranker } from "../bm25/bm25.ranker.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export interface KeywordSearchOptions {
  tenantId?: string;
  project?: string;
  type?: string;
  limit?: number;
}

export class KeywordRetriever {
  constructor(
    private index: KeywordIndex,
    private repository: MemoryRepository,
  ) {}

  async search(
    query: string,
    options?: KeywordSearchOptions,
  ): Promise<RetrievalResult[]> {
    if (options?.limit !== undefined && options.limit <= 0) {
      return [];
    }
    const ids = this.index.search(query);

    const memories = await this.repository.getAll(options?.tenantId);

    const ranker = new BM25Ranker(this.index);

    const results = memories
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

    return options?.limit !== undefined
      ? results.slice(0, options.limit)
      : results;
  }
}
