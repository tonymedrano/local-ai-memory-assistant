import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FeatureExtractor } from "../features/feature.extractor.js";
import type { LTRModelProvider } from "../model/ltr.model.provider.interface.js";

export interface LTRRankingResult {
  result: RetrievalResult;
  score: number;
}

export class LTRRanker {
  constructor(
    private featureExtractor: FeatureExtractor,
    private modelProvider: LTRModelProvider,
  ) {}

  rank(query: string, results: RetrievalResult[]): LTRRankingResult[] {
    const model = this.modelProvider.getModel();

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
          score: model.predict(rankedFeatures.features),
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
