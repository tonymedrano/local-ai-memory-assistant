import type { RankedResult } from "../reranker.types.js";
import type {
  QualityRankedResult,
  QualityScore,
  QualityWeights,
} from "./quality.types.js";

import { DEFAULT_QUALITY_WEIGHTS } from "./quality.types.js";

import { clamp } from "./quality.utils.js";

export class QualityScoringService {
  constructor(private weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS) {}

  async score(results: RankedResult[]): Promise<QualityRankedResult[]> {
    return results.map((result) => {
      const qualityScore = this.calculate(result);

      return {
        ...result,
        qualityScore,
      };
    });
  }

  private calculate(result: RankedResult): QualityScore {
    const memory = result.memory;

    const relevance = clamp(result.rerankScore);

    const confidence = clamp(memory.confidence ?? 0.5);

    const importance = this.normalizeImportance(memory.importance);

    const freshness = this.calculateFreshness(memory.createdAt);

    const diversity = 1;

    const redundancyPenalty = 0;

    const finalScore =
      relevance * this.weights.relevance +
      confidence * this.weights.confidence +
      importance * this.weights.importance +
      freshness * this.weights.freshness +
      diversity * this.weights.diversity;

    return {
      relevance,
      confidence,
      importance,
      freshness,
      diversity,
      redundancyPenalty,
      finalScore,
    };
  }

  private calculateFreshness(createdAt?: Date | string): number {
    if (!createdAt) return 0.5;

    const date = new Date(createdAt);

    const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

    return clamp(1 / (1 + ageDays / 365));
  }

  private normalizeImportance(value?: number): number {
    if (value === undefined) return 0.5;

    return clamp(value / 3);
  }
}
