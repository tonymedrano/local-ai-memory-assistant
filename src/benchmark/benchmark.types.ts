export interface BenchmarkCase {
  query: string;
  expectedTexts: string[];
  expectedSources?: string[];
}

export interface BenchmarkResult {
  query: string;
  retrieved: string[];
  expected: string[];
  recall: number;
  mrr: number;
  ndcg: number;
  latencyMs: number;
}

export interface BenchmarkReport {
  totalQueries: number;
  averageRecall: number;
  averageMRR: number;
  averageNDCG: number;
  averageLatency: number;
  results: BenchmarkResult[];
}
