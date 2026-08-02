import type { QualityRankedResult } from "../quality.types.js";

import type {
  DuplicateDetectionResult,
  DuplicateMatch,
} from "./duplicate.types.js";

import type { SimilarityProvider } from "../similarity.types.js";

export class DuplicateDetector {
  constructor(
    private similarity: SimilarityProvider,
    private threshold = 0.85,
  ) {}

  async removeDuplicates(
    results: QualityRankedResult[],
  ): Promise<DuplicateDetectionResult> {
    const unique: QualityRankedResult[] = [];

    const matches: DuplicateMatch[] = [];

    for (const candidate of results) {
      let duplicated = false;

      for (const existing of unique) {
        const similarity = await this.similarity.similarity(
          candidate.memory.text,
          existing.memory.text,
        );

        if (similarity >= this.threshold) {
          duplicated = true;

          matches.push({
            sourceId: existing.memory.id,
            duplicateId: candidate.memory.id,
            similarity,
          });

          break;
        }
      }

      if (!duplicated) {
        unique.push(candidate);
      }
    }

    return {
      results: unique,
      duplicatesRemoved: results.length - unique.length,
      matches,
    };
  }
}
