import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FeatureExtractor } from "../features/feature.extractor.js";
import type { LTRModelProvider } from "../model/ltr.model.provider.interface.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";

export class LearningRanker {
  score: any;
  constructor(
    private readonly extractor: FeatureExtractor,
    private readonly modelProvider: LTRModelProvider,
  ) {}

  rank<T extends RetrievalResult>(scope: FeedbackScope, results: T[]): T[] {
    const model = this.modelProvider.getModel(scope);
    return results
      .map((result) => {
        const ranked = this.extractor.extract({
          memory: result.memory,
          metrics: {
            semantic: result.semanticScore ?? result.score ?? 0,
            bm25: result.keywordScore ?? 0,
            graphEvidence: result.graphScore ?? 0,
            diversity: result.diversityScore ?? 0,
            duplicatePenalty: result.duplicatePenalty ?? 0,
          },
        });

        const learningScore = model.predict(
          ranked.features,
        );

        return {
          ...result,
          ltrScore: learningScore,
          score: learningScore,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
