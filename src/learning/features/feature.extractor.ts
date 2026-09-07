// src/learning/features/feature.extractor.ts

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FeatureVector, RankedFeatures } from "./feature.types.js";

export class FeatureExtractor {
  extract(result: RetrievalResult): RankedFeatures {
    const memory = result.memory;

    const features: FeatureVector = {
      semantic: result.semanticScore ?? result.score ?? 0,
      bm25: result.keywordScore ?? 0,
      importance: memory.importance ?? 0,
      confidence: memory.confidence ?? 0,
      freshness: this.calculateFreshness(memory.updatedAt!),
      graphEvidence: result.graphScore ?? 0,
      accessCount: memory.accessCount ?? 0,
      diversity: result.diversityScore ?? 0,
      duplicatePenalty: result.duplicatePenalty ?? 0,
    };

    return {
      memoryId: memory.id!,
      features,
    };
  }

  private calculateFreshness(date: Date | string): number {
    const updated = new Date(date).getTime();

    const now = Date.now();

    const ageDays = (now - updated) / (1000 * 60 * 60 * 24);

    return Math.max(0, 1 - ageDays / 365);
  }
}
