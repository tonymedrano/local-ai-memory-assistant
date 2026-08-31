import type {
  FeatureInput,
  FeatureVector,
  RankedFeatures,
} from "./feature.types.js";

export class FeatureExtractor {
  extract(input: FeatureInput): RankedFeatures {
    const { memory, metrics } = input;

    const features: FeatureVector = {
      semantic: metrics?.semantic ?? 0,
      bm25: metrics?.bm25 ?? 0,
      importance: memory.importance ?? 0,
      confidence: memory.confidence ?? 0,
      freshness: this.calculateFreshness(
        memory.updatedAt ?? memory.createdAt ?? new Date(),
      ),
      graphEvidence: metrics?.graphEvidence ?? 0,
      accessCount: this.normalizeAccessCount(memory.accessCount ?? 0),
      diversity: metrics?.diversity ?? 0,
      duplicatePenalty: metrics?.duplicatePenalty ?? 0,
      feedbackScore: metrics?.feedbackScore ?? 0,
      retrievalFrequency: this.calculateRetrievalFrequency(
        memory.accessCount ?? 0,
        memory.createdAt,
      ),

      ageScore: this.calculateAgeScore(memory.createdAt),
      contextScore: metrics?.contextScore ?? 0,
    };

    return {
      memoryId: memory.id!,
      features,
    };
  }

  private calculateRetrievalFrequency(
    accesses: number,
    createdAt?: Date | string,
  ): number {
    if (!createdAt) return 0;

    const days = Math.max(
      1,
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.min(1, accesses / days / 10);
  }

  private calculateAgeScore(createdAt?: Date | string): number {
    if (!createdAt) return 0;

    const days =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

    return Math.exp(-days / 365);
  }

  private calculateFreshness(date: Date | string): number {
    const timestamp = new Date(date).getTime();

    const ageDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

    return Math.max(0, 1 - ageDays / 365);
  }

  private normalizeAccessCount(count: number): number {
    return Math.log1p(count) / Math.log1p(1000);
  }
}
