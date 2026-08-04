import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FeatureExtractor } from "../features/feature.extractor.js";
import type { LTRModel } from "../training/ltr.model.js";

export interface LTRRankingResult {
  result: RetrievalResult;
  score: number;
}

export class LTRRanker {
  constructor(
    private featureExtractor: FeatureExtractor,
    private model: LTRModel,
  ) {}

  rank(query: string, results: RetrievalResult[]): LTRRankingResult[] {
    return results
      .map((result) => {
        const rankedFeatures = this.featureExtractor.extract({
          memory: result.memory,
          metrics: {
            semantic: result.semanticScore,
            bm25: result.keywordScore,
            graphEvidence: result.graphScore,
            diversity: result.diversityScore,
          },
        });

        return {
          result,

          score: this.model.predict(rankedFeatures.features),
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
