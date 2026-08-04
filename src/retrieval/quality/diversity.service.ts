import type { QualityRankedResult } from "./quality.types.js";
import type { SimilarityProvider } from "./similarity.types.js";

export class DiversityService {
  constructor(
    private similarity: SimilarityProvider,
    private lambda = 0.7,
  ) {}

  async filter(results: QualityRankedResult[], limit: number = 5) {
    const selected: QualityRankedResult[] = [];

    const remaining = [...results];

    while (remaining.length && selected.length < limit) {
      let bestIndex = 0;

      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];

        const diversityScore = await this.mmrScore(candidate, selected);

        if (diversityScore > bestScore) {
          bestScore = diversityScore;

          bestIndex = i;
        }
      }

      selected.push(remaining.splice(bestIndex, 1)[0]);
    }

    return selected;
  }

  private async mmrScore(
    candidate: QualityRankedResult,
    selected: QualityRankedResult[],
  ) {
    if (selected.length === 0) return candidate.qualityScore.finalScore;

    let maxSimilarity = 0;

    for (const item of selected) {
      const similarity = await this.similarity.similarity(
        candidate.memory.text,
        item.memory.text,
      );

      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return (
      this.lambda * candidate.qualityScore.finalScore -
      (1 - this.lambda) * maxSimilarity
    );
  }
}
