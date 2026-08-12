export type RetrievalStrategyName =
  | "balanced"
  | "semantic-heavy"
  | "keyword-heavy"
  | "broad"
  | "focused";

export interface RetrievalStrategy {
  name: RetrievalStrategyName;

  semanticWeight: number;
  bm25Weight: number;

  candidateLimit: number;

  enableReranking: boolean;
  enableDiversity: boolean;
}

export interface StrategySelectionContext {
  specificity: number;
  complexity: number;
  semanticIntent: number;
  tokenCount: number;
}

export interface StrategySelectionResult {
  strategy: RetrievalStrategy;
  reason: string;
}
