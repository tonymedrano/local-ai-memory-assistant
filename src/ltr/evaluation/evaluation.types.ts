export interface EvaluationQuery {
  query: string;
  relevant: {
    [memoryId: string]: number;
  };
}

export interface RankingResult {
  query: string;
  results: string[];
}

export interface EvaluationSummary {
  precisionAtK: number;
  recallAtK: number;
  mrr: number;
  ndcgAtK: number;
}
