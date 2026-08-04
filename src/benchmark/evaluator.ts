import { recallAtK } from "./metrics/recall.js";

import { meanReciprocalRank } from "./metrics/mrr.js";

import { ndcgAtK } from "./metrics/ndcg.js";

import type { BenchmarkCase, BenchmarkResult } from "./benchmark.types.js";

export function evaluate(
  test: BenchmarkCase,
  retrieved: string[],
  latencyMs: number,
): BenchmarkResult {
  const expected = test.expectedTexts ?? [];

  return {
    query: test.query,

    retrieved,

    expected,

    recall: recallAtK(retrieved, expected),

    mrr: meanReciprocalRank(retrieved, expected),

    ndcg: ndcgAtK(retrieved, expected),

    latencyMs,
  };
}
