import type { Memory } from "../../memory/memory.types.js";
import type {
  MemoryRepository,
  SearchOptions,
} from "../../memory/memory.repository.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

import { EmbeddingService } from "../../embedding/embedding.service.js";

export class VectorRetriever {
  constructor(
    private readonly repository: MemoryRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async search(
    query: string,
    options?: SearchOptions,
  ): Promise<RetrievalResult[]> {
    const vector = await this.embeddingService.embed(query);

    const results = await this.repository.search(vector, options);

    return results.map((result) => ({
      memory: {
        ...(result.payload as unknown as Memory),
        id: String(result.id),
      },

      score: result.score,

      source: "vector" as const,
    }));
  }
}
