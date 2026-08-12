import type {
  RetrievalStrategy,
  StrategySelectionContext,
  StrategySelectionResult,
} from "./strategy.types.js";

export class StrategySelector {
  select(context: StrategySelectionContext): StrategySelectionResult {
    const { specificity, tokenCount } = context;

    if (specificity < 0.5) {
      return {
        strategy: this.broadStrategy(),
        reason: "Low-specificity query",
      };
    }

    if (specificity >= 0.75 && tokenCount >= 4) {
      return {
        strategy: this.focusedStrategy(),
        reason: "Specific multi-token query",
      };
    }

    if (specificity >= 0.7 && tokenCount >= 3) {
      return {
        strategy: this.keywordHeavyStrategy(),
        reason: "Specific query with multiple concrete terms",
      };
    }

    return {
      strategy: this.balancedStrategy(),
      reason: "Balanced query characteristics",
    };
  }

  private balancedStrategy(): RetrievalStrategy {
    return {
      name: "balanced",
      semanticWeight: 0.5,
      bm25Weight: 0.3,
      candidateLimit: 20,
      enableReranking: true,
      enableDiversity: true,
    };
  }

  private semanticHeavyStrategy(): RetrievalStrategy {
    return {
      name: "semantic-heavy",
      semanticWeight: 0.65,
      bm25Weight: 0.2,
      candidateLimit: 25,
      enableReranking: true,
      enableDiversity: true,
    };
  }

  private keywordHeavyStrategy(): RetrievalStrategy {
    return {
      name: "keyword-heavy",
      semanticWeight: 0.4,
      bm25Weight: 0.45,
      candidateLimit: 20,
      enableReranking: true,
      enableDiversity: true,
    };
  }

  private broadStrategy(): RetrievalStrategy {
    return {
      name: "broad",
      semanticWeight: 0.55,
      bm25Weight: 0.25,
      candidateLimit: 30,
      enableReranking: true,
      enableDiversity: true,
    };
  }

  private focusedStrategy(): RetrievalStrategy {
    return {
      name: "focused",
      semanticWeight: 0.5,
      bm25Weight: 0.4,
      candidateLimit: 10,
      enableReranking: true,
      enableDiversity: false,
    };
  }
}
