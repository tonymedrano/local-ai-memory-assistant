import type { TraversedNode } from "../graph/graph.traverser.js";
import type { SemanticQuery, ExpandedTerm } from "./semantic.types.js";

import { TermNormalizer } from "./term.normalizer.js";
import { TERM_WEIGHTS } from "./term.weights.js";

export class SemanticQueryBuilder {
  private readonly normalizer = new TermNormalizer();

  build(
    original: string,
    entities: string[],
    traversed: TraversedNode[],
  ): SemanticQuery {
    const normalizedEntities = this.normalizer.normalizeMany(entities);

    const graphNodes = [
      ...new Set(
        traversed.map((item) => this.normalizer.normalize(item.node.label)),
      ),
    ];

    const graphRelations = [
      ...new Set(
        traversed.flatMap((item) =>
          item.path
            .map((step) => step.relation)
            .filter(Boolean)
            .map((relation) => this.normalizer.normalizeRelation(relation!)),
        ),
      ),
    ];

    const graphPaths = traversed.map((item) =>
      item.path.map((step) => step.label).join(" -> "),
    );

    const expandedTerms: ExpandedTerm[] = [
      ...normalizedEntities.map((term) => ({
        term,
        weight: TERM_WEIGHTS.entity,
        source: "entity" as const,
      })),

      ...graphNodes
        .filter((term) => !normalizedEntities.includes(term))
        .map((term) => ({
          term,
          weight: TERM_WEIGHTS.graphNode,
          source: "graph" as const,
        })),

      ...graphRelations.map((term) => ({
        term,
        weight: TERM_WEIGHTS.relation,
        source: "relation" as const,
      })),
    ];

    return {
      original,
      entities: normalizedEntities,
      expandedTerms,
      graphNodes,
      graphRelations,
      graphPaths,
    };
  }
}
