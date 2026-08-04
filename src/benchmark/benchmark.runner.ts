import { benchmarkDataset } from "./benchmark.dataset.js";

import type { BenchmarkReport } from "./benchmark.types.js";

import type { RetrievalPipeline } from "../retrieval/pipeline/retrieval.pipeline.js";

import { evaluate } from "./evaluator.js";
import { extractResults } from "./sources/source.extractor.js";

export async function runBenchmark(
  pipeline: RetrievalPipeline,
): Promise<BenchmarkReport> {
  const results = [];

  for (const test of benchmarkDataset) {
    const start = performance.now();

    const response = await pipeline.retrieve({
      query: test.query,
      limit: 5,
    });

    const latency = performance.now() - start;

    const extracted = extractResults(response);

    const retrieved = extracted.map((item) => item.text);

    results.push(evaluate(test, retrieved, latency));
  }

  return {
    totalQueries: results.length,
    averageRecall: average(results.map((r) => r.recall)),
    averageMRR: average(results.map((r) => r.mrr)),
    averageNDCG: average(results.map((r) => r.ndcg)),
    averageLatency: average(results.map((r) => r.latencyMs)),
    results,
  };
}

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}
