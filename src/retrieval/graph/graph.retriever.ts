import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";

import type { RetrievalResult } from "../types.js";

export class GraphRetriever {
  async search(query: string): Promise<RetrievalResult[]> {
    const tokens = query.toLowerCase().split(/\s+/);

    const results = inferenceRepository.getAll().filter((item) => {
      const text = [item.subject, item.relation, item.object]
        .join(" ")
        .toLowerCase();

      return tokens.some((token) => text.includes(token));
    });

    return results.map((item, index) => ({
      memory: {
        id: `inference-${index}`,
        text: `${item.subject} ${item.relation} ${item.object}`,
        confidence: item.confidence,
        createdAt: new Date().toISOString(),
      },
      score: item.confidence,
      source: "graph",
    }));
  }
}
