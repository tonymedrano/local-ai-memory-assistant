import { recall } from "../../memory/memory.service.js";
import type { Memory } from "../../memory/memory.types.js";
import type { RetrievalResult } from "../types.js";

export class VectorRetriever {
  async search(query: string): Promise<RetrievalResult[]> {
    const results = await recall(query);

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
