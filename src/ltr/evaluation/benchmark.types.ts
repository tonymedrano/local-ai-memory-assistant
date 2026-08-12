export interface BenchmarkQuery {
  query: string;
  expected: string[];
}

export interface BenchmarkRunResult {
  query: string;
  results: string[];
  elapsedMs: number;
}

export interface ComparisonResult {
  query: string;
  baseline: BenchmarkRunResult;
  ltr: BenchmarkRunResult;
}
