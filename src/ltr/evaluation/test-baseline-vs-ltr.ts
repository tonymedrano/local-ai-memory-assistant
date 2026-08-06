import { retrievalPipeline } from "../../core/container.js";

import { BaselineRunner } from "./baseline.runner.js";
import { LTRRunner } from "./ltr.runner.js";
import { ComparisonRunner } from "./comparison.runner.js";

import { benchmarkDataset } from "./benchmark.dataset.js";

const baselineRunner = new BaselineRunner(retrievalPipeline);

const ltrRunner = new LTRRunner(retrievalPipeline);

const comparison = new ComparisonRunner(baselineRunner, ltrRunner);

const results = await comparison.run(benchmarkDataset);

console.log("\n=== BASELINE VS LTR ===\n");

for (const result of results) {
  console.log("QUERY:", result.query);

  console.log("\nBASELINE:", result.baseline.results);

  console.log("LATENCY:", result.baseline.elapsedMs, "ms");

  console.log("\nLTR:", result.ltr.results);

  console.log("LATENCY:", result.ltr.elapsedMs, "ms");

  console.log("\n----------------------");
}
