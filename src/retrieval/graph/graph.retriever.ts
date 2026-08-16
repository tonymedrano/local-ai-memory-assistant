import { graphRepository } from "../../knowledge/graph/graph.repository.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

import { EntityExtractor } from "./entity.extractor.js";
import { GraphTraverser } from "./graph.traverser.js";

export interface GraphSearchOptions {
  limit?: number;
}

export class GraphRetriever {
  private readonly extractor = new EntityExtractor();

  private readonly traverser = new GraphTraverser(graphRepository);

  async search(
    query: string,
    options?: GraphSearchOptions,
  ): Promise<RetrievalResult[]> {
    if (options?.limit !== undefined && options.limit <= 0) {
      return [];
    }

    const entities = this.extractor.extract(query);

    if (entities.length === 0) {
      return [];
    }

    const traversed = this.traverser.traverse(entities, 2);

    const results: RetrievalResult[] = traversed.map((item) => ({
      memory: {
        id: `graph-${item.node.id}`,
        text: item.path.map((p) => p.label).join(" -> "),
        confidence: item.score,
        createdAt: new Date().toISOString(),
        metadata: {
          type: "graph",
          entity: item.node.label,
          path: item.path.map((p) => p.label),
        },
      },
      score: item.score,
      source: "graph" as const,
    }));

    return options?.limit !== undefined
      ? results.slice(0, options.limit)
      : results;
  }
}
