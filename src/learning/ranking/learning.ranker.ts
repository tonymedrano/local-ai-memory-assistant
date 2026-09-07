// src/learning/ranking/learning.ranker.ts

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

import { FeatureExtractor } from "../features/feature.extractor.js";

import { LinearModel } from "../model/linear.model.js";

export interface RankedMemory {
  memory: RetrievalResult;

  score: number;
}

export class LearningRanker {
  constructor(
    private readonly extractor: FeatureExtractor,
    private readonly model: LinearModel,
  ) {}

  rank(memories: RetrievalResult[]): RankedMemory[] {
    const ranked = memories.map((memory) => {
      const extracted = this.extractor.extract(memory);

      const score = this.model.predict(extracted.features);

      return {
        memory,

        score,
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    return ranked;
  }
}
