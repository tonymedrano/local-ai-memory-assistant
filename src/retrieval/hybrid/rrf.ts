import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export class ReciprocalRankFusion {
  constructor(private readonly k = 60) {}

  fuse(...rankings: RetrievalResult[][]): RetrievalResult[] {
    const scores = new Map<string, RetrievalResult>();

    for (const ranking of rankings) {
      ranking.forEach((result, index) => {
        const id = result.memory.id;

        if (!id) {
          return;
        }

        const rrfScore = 1 / (this.k + index + 1);

        const existing = scores.get(id);

        if (existing) {
          existing.score += rrfScore;
        } else {
          scores.set(id, {
            memory: result.memory,
            score: rrfScore,
            source: "hybrid",
          });
        }
      });
    }

    return [...scores.values()].sort((a, b) => b.score - a.score);
  }
}
