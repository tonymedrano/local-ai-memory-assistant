import type { Conflict } from "./conflict.types.js";

import { graphRepository } from "../graph/graph.repository.js";

const oppositeRelations: Record<string, string[]> = {
  uses: ["does-not-use"],

  requires: ["does-not-require"],
};

export function detectConflicts(): Conflict[] {
  const graph = graphRepository.getGraph();

  console.log(
    "[ConflictDetection] edges:",
    graph.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        relation: edge.relation
    }))
);

  const conflicts: Conflict[] = [];

  for (const edge of graph.edges) {
    const opposites = oppositeRelations[edge.relation];

    if (!opposites) {
      continue;
    }

    for (const opposite of opposites) {
      const conflict = graph.edges.find(
        (other) =>
          other.source === edge.source &&
          other.target === edge.target &&
          other.relation === opposite,
      );

      if (conflict) {
        conflicts.push({
          subject: edge.source,

          object: edge.target,

          relations: [edge.relation, conflict.relation],

          severity: Number(
            Math.abs(edge.confidence - conflict.confidence).toFixed(2),
          ),

          evidence: [edge.id, conflict.id],

          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return conflicts;
}
