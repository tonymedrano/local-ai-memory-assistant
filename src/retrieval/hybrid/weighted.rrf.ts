import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

const SOURCE_WEIGHTS: Record<string, number> = {
  vector: 1,
  keyword: 1.1,

  // nodos del grafo
  graph: 1.0,

  // hechos derivados del grafo
  "graph-evidence": 1.5,

  hybrid: 1,
};

export class WeightedReciprocalRankFusion {
  constructor(private readonly k = 60) {}

  fuse(...rankings: RetrievalResult[][]): RetrievalResult[] {
    const scores = new Map<string, RetrievalResult>();

    for (const ranking of rankings) {
      ranking.forEach((result, index) => {
        const id = result.memory.id;

        if (!id) {
          return;
        }

        const sourceWeight = SOURCE_WEIGHTS[result.source] ?? 1;

        const score = (1 / (this.k + index + 1)) * sourceWeight;

        const existing = scores.get(id);

        if (existing) {
          existing.score += score;

          existing.originalSources ??= [];

          if (!existing.originalSources.includes(result.source)) {
            existing.originalSources.push(result.source);
          }
        } else {
          scores.set(id, {
            memory: result.memory,
            score,
            source: "hybrid",
            originalSources: [result.source],
          });
        }
      });
    }

    return Array.from(scores.values()).sort((a, b) => b.score - a.score);
  }
}
