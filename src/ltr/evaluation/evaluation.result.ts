export interface QueryEvaluation {
  query: string;

  precisionAtK: number;

  recallAtK: number;

  mrr: number;

  ndcgAtK: number;
}

export interface EvaluationResult {
  evaluatedAt: string;

  samples: number;

   /**
   * Number of retrieved results evaluated
   */
  k: number;

  precisionAtK: number;

  recallAtK: number;

  mrr: number;

  ndcgAtK: number;

  queries: QueryEvaluation[];
}
