export interface MetricComparison {
  baseline: number;

  ltr: number;

  improvement: number;
}

export function compareMetric(baseline: number, ltr: number): MetricComparison {
  return {
    baseline,

    ltr,

    improvement: ((ltr - baseline) / baseline) * 100,
  };
}
