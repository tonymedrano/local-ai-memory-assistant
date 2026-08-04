import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

import { FeatureExtractor } from "../features/feature.extractor.js";
import { LearningRanker } from "./learning.ranker.js";

export class LTRRankerAdapter {
  constructor(
    private readonly extractor: FeatureExtractor,
    private readonly ranker: LearningRanker
  ) {}

  rank(results: RetrievalResult[]): RetrievalResult[] {
    return results
      .map((result) => {
        const features = this.extractor.extract(result);

        return {
          ...result,
          score: this.ranker.score(features),
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}