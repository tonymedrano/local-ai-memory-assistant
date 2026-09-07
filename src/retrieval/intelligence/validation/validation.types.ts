export interface EvaluationMetrics {
  precisionAtK: number;
  recallAtK: number;
  mrr: number;
  ndcgAtK: number;
}

export interface StrategyComparison {
  query: string;

  baseline: EvaluationMetrics;
  adaptive: EvaluationMetrics;

  strategy: string;

  improvement: {
    precisionAtK: number;
    recallAtK: number;
    mrr: number;
    ndcgAtK: number;
  };

  latency: {
    baselineMs: number;
    adaptiveMs: number;
    overheadMs: number;
    overheadPercent: number;
  };
}

export interface StrategyValidationSummary {
  queries: number;

  improved: number;
  equal: number;
  regressed: number;

  baseline: EvaluationMetrics;
  adaptive: EvaluationMetrics;

  averageLatency: {
    baselineMs: number;
    adaptiveMs: number;
    overheadPercent: number;
  };

  comparisons: StrategyComparison[];
}
