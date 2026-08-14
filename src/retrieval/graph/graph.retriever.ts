import { graphRepository } from "../../knowledge/graph/graph.repository.js";
import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

import { EntityExtractor } from "./entity.extractor.js";
import { GraphTraverser } from "./graph.traverser.js";

export class GraphRetriever {
  private readonly extractor = new EntityExtractor();

  private readonly traverser = new GraphTraverser(graphRepository);

  async search(query: string): Promise<RetrievalResult[]> {
    const entities = this.extractor.extract(query);

    if (entities.length === 0) {
      return [];
    }

    const traversed = this.traverser.traverse(entities, 2);

    return traversed.map((item) => {
      const inferred = inferenceRepository.find(item.node.label);

      const derived =
        inferred.length > 0
          ? inferred
              .map(
                (i) =>
                  `${i.subject} ${i.relation} ${i.object}`,
              )
              .join("\n")
          : "";

      return {
        memory: {
          id: `graph-${item.node.id}`,

          text: [
            item.path.map((p) => p.label).join(" -> "),
            derived,
          ]
            .filter(Boolean)
            .join("\n"),

          confidence: item.score,

          createdAt: new Date().toISOString(),
        },

        score: item.score,

        source: "graph",
      };
    });
  }
}