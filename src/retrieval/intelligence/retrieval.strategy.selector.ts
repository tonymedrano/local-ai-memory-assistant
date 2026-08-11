import type { QueryProfile } from "./query.types.js";
import type { RetrievalStrategy } from "./retrieval.strategy.types.js";

export class RetrievalStrategySelector {
  select(profile: QueryProfile): RetrievalStrategy {
    let vectorWeight = 0.4;
    let keywordWeight = 0.4;
    let graphWeight = 0.2;

    let topK = 10;

    let enableReranking = true;
    let enableGraphTraversal = false;
    let enableQueryExpansion = false;

    if (profile.comparisonIntent >= 0.7) {
      vectorWeight = 0.55;
      keywordWeight = 0.35;
      graphWeight = 0.1;

      enableGraphTraversal = false;
      enableQueryExpansion = true;
      topK = 10;
    } else if (profile.relationalIntent >= 0.7) {
      vectorWeight = 0.35;
      keywordWeight = 0.15;
      graphWeight = 0.5;

      enableGraphTraversal = true;
      enableQueryExpansion = true;
      topK = 12;
    } else if (profile.semanticIntent >= 0.8) {
      vectorWeight = 0.6;
      keywordWeight = 0.25;
      graphWeight = 0.15;

      enableQueryExpansion = true;
      topK = 10;
    } else if (profile.keywordIntent >= 0.7) {
      vectorWeight = 0.45;
      keywordWeight = 0.45;
      graphWeight = 0.1;

      topK = 8;
    }

    if (profile.temporalIntent >= 0.7) {
      enableQueryExpansion = false;
      topK = Math.max(topK, 12);
    }

    return {
      vectorWeight,
      keywordWeight,
      graphWeight,
      topK,
      enableReranking,
      enableGraphTraversal,
      enableQueryExpansion,
    };
  }
}
