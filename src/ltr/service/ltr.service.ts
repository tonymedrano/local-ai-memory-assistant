import type { LinearModel } from "../model/linear.model.js";
import type { FeatureExtractor } from "../features/feature.extractor.js";

export class LTRService {
  constructor(
    private model: LinearModel,
    private extractor: FeatureExtractor,
  ) {}

  rank(results: any[]) {
    return results
      .map((result) => {
        const rankedFeatures = this.extractor.extract({
          memory: result.memory,
          metrics: {
            semantic: result.semanticScore,
            bm25: result.bm25Score,
            graphEvidence: result.graphScore,
            diversity: result.diversity,
            duplicatePenalty: result.duplicatePenalty,
          },
        });

        const score = this.model.predict(rankedFeatures.features);

        return {
          ...result,
          ltrScore: score,
        };
      })
      .sort((a, b) => b.ltrScore - a.ltrScore);
  }
}
