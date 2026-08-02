import type { TraversedNode } from "./graph.traverser.js";

export const DEFAULT_RELATION_WEIGHTS: Record<string, number> = {
  requires: 1.0,
  uses: 0.9,
  depends: 0.85,
  contains: 0.8,
  belongsTo: 0.7,
  relatedTo: 0.5,
  mentions: 0.2,
};

export class GraphScorer {
  constructor(
    private readonly weights = DEFAULT_RELATION_WEIGHTS,
  ) {}

  score(nodes: TraversedNode[]): TraversedNode[] {
    return nodes
      .map((item) => {
        const distancePenalty = 1 / (item.distance + 1);

        let relationScore = 1;
        let confidenceScore = 1;

        // Recorremos todo el camino (el primer nodo no tiene relación)
        for (let i = 1; i < item.path.length; i++) {
          const step = item.path[i];

          relationScore *=
            this.weights[step.relation ?? ""] ?? 0.5;

          confidenceScore *= step.confidence ?? 1;
        }

        const finalScore =
          distancePenalty *
          relationScore *
          confidenceScore;

        return {
          ...item,
          score: Number(finalScore.toFixed(3)),
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.distance - b.distance;
      });
  }
}