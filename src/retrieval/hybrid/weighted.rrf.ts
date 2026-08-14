import type {
  RetrievalResult,
  RetrievalSource,
} from "../../retrieval/retrieval.types.js";

export interface RRFWeights {
  vector?: number;
  keyword?: number;
  graph?: number;
  graphEvidence?: number;
}

const DEFAULT_WEIGHTS: Required<RRFWeights> = {
  vector: 1,
  keyword: 1.1,
  graph: 1,
  graphEvidence: 1.5,
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
      {
        results: vectorResults,
        weight: weights.vector,
      },
      {
        results: keywordResults,
        weight: weights.keyword,
      },
      {
        results: graphResults,
        weight: weights.graph,
      },
      {
        results: evidenceResults,
        weight: weights.graphEvidence,
      },
    ];

    const scores = new Map<string, RetrievalResult>();

    for (const { results, weight } of rankings) {
      results.forEach((result, index) => {
        const id = result.memory.id;

        if (!id || weight <= 0) {
          return;
        }

        const score = weight / (this.k + index + 1);

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
