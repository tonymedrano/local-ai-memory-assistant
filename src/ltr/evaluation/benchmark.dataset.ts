import type { BenchmarkQuery } from "./benchmark.types.js";

export const benchmarkDataset: BenchmarkQuery[] = [
  {
    query: "angular signals",
    expected: ["memory-angular"],
  },

  {
    query: "typescript interfaces",
    expected: ["memory-typescript"],
  },

  {
    query: "node backend",
    expected: ["memory-node"],
  },
];
