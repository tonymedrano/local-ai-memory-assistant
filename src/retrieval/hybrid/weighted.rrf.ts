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

export interface FusionWeights {
  vector: number;
  keyword: number;
  graph: number;
  graphEvidence: number;
}

export class WeightedReciprocalRankFusion {
  constructor(private readonly k = 60) {}

  fuse(
    vectorResults: RetrievalResult[],
    keywordResults: RetrievalResult[],
    graphResults: RetrievalResult[],
    evidenceResults: RetrievalResult[],
    weights: FusionWeights,
  ): RetrievalResult[] {
    const rankings = [
      vectorResults,
      keywordResults,
      graphResults,
      evidenceResults,
    ];

    const scores = new Map<string, RetrievalResult>();

    for (const ranking of rankings) {
      ranking.forEach((result, index) => {
        const id = result.memory.id;

        if (!id) {
          return;
        }

        const sourceWeight = SOURCE_WEIGHTS[result.source] ?? 1;

        const strategyWeight = this.getStrategyWeight(result.source, weights);

        const score =
          (1 / (this.k + index + 1)) * sourceWeight * strategyWeight;

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

  private getStrategyWeight(source: string, weights: FusionWeights): number {
    switch (source) {
      case "vector":
        return weights.vector;

      case "keyword":
        return weights.keyword;

      case "graph":
        return weights.graph;

      case "graph-evidence":
        return weights.graphEvidence;

      default:
        return 1;
    }
  }
}
