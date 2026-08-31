import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FeatureExtractor } from "../features/feature.extractor.js";
import type { LTRModelProvider } from "../model/ltr.model.provider.interface.js";
import type { ContextModel } from "../../context/model/context.model.js";
import type { ContextAwareScoringService } from "../../retrieval/context/context-aware-scoring.service.js";

export interface LTRRankingResult {
  result: RetrievalResult;
  score: number;
}

export class LTRRanker {
  constructor(
    private readonly featureExtractor: FeatureExtractor,
    private readonly modelProvider: LTRModelProvider,
    private readonly contextScoring?: ContextAwareScoringService,
  ) {}

  rank(
    query: string,
    results: RetrievalResult[],
    context?: ContextModel,
  ): LTRRankingResult[] {
    const model = this.modelProvider.getModel();

    return results
      .map((result) => {
        const contextScore =
          context && this.contextScoring
            ? this.contextScoring.score({
                memory: result.memory,
                context,
              }).score
            : undefined;

        const rankedFeatures = this.featureExtractor.extract({
          memory: result.memory,
          metrics: {
            semantic: result.semanticScore,
            bm25: result.keywordScore,
            graphEvidence: result.graphScore,
            diversity: result.diversityScore,
            contextScore,
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
