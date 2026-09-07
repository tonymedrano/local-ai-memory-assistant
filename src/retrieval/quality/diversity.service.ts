import type { QualityRankedResult } from "./quality.types.js";
import type { SimilarityProvider } from "./similarity.types.js";

export interface DiversityFilterOptions {
  /**
   * Sources that should be preserved when available.
   *
   * The service will select the best result from each required
   * source before applying normal MMR selection.
   */
  requiredSources?: string[];

  /**
   * Minimum number of results to preserve for each required source.
   *
   * Defaults to 1.
   */
  minimumPerSource?: number;
}

export class DiversityService {
  constructor(
    private similarity: SimilarityProvider,
    private lambda = 0.7,
  ) {}

  async filter(
    results: QualityRankedResult[],
    limit: number = 5,
    options?: DiversityFilterOptions,
  ): Promise<QualityRankedResult[]> {
    if (limit <= 0 || results.length === 0) {
      return [];
    }

    const selected: QualityRankedResult[] = [];

    const remaining = [...results];

    /**
     * Preserve strategically important sources first.
     *
     * This is especially important for knowledge retrieval:
     *
     * graph
     * graph-evidence
     *
     * represent information that may not exist in the vector
     * memory collection.
     */
    if (options?.requiredSources?.length) {
      const minimumPerSource = Math.max(1, options.minimumPerSource ?? 1);

      for (const source of options.requiredSources) {
        for (let count = 0; count < minimumPerSource; count++) {
          if (selected.length >= limit) {
            break;
          }

          const bestIndex = this.findBestSourceCandidate(remaining, source);

          if (bestIndex === -1) {
            break;
          }

          selected.push(remaining.splice(bestIndex, 1)[0]);
        }

        if (selected.length >= limit) {
          break;
        }
      }
    }

    /**
     * Fill the remaining positions using normal MMR.
     */
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

  private findBestSourceCandidate(
    results: QualityRankedResult[],
    source: string,
  ): number {
    let bestIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < results.length; i++) {
      const candidate = results[i];

      if (candidate.source !== source) {
        continue;
      }

      if (candidate.qualityScore.finalScore > bestScore) {
        bestScore = candidate.qualityScore.finalScore;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  private async mmrScore(
    candidate: QualityRankedResult,
    selected: QualityRankedResult[],
  ): Promise<number> {
    if (selected.length === 0) {
      return candidate.qualityScore.finalScore;
    }

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
