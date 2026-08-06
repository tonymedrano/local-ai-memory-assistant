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

export interface EvaluationLabel {
  memoryId: string;

  label: number;
}

export interface EvaluationSample {
  query: string;

  expected: EvaluationLabel[];
}

export interface EvaluationDataset {
  version: number;

  createdAt: string;

  samples: EvaluationSample[];
}
