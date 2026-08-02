import { createRetrievalPipeline } from "../retrieval/retrieval.factory.js";

import { runBenchmark } from "./benchmark.runner.js";

async function main() {
  console.log("==============================");
  console.log(" Retrieval Benchmark");
  console.log("==============================");

  const pipeline = createRetrievalPipeline();

  const report = await runBenchmark(pipeline);

  console.log("\nSummary\n");

  console.table({
    queries: report.totalQueries,
    Recall: report.averageRecall.toFixed(3),
    MRR: report.averageMRR.toFixed(3),
    NDCG: report.averageNDCG.toFixed(3),
    Latency: `${report.averageLatency.toFixed(2)} ms`,
  });

  console.log("\nDetails\n");

  console.table(
    report.results.map((result) => ({
      query: result.query,
      recall: result.recall.toFixed(3),
      mrr: result.mrr.toFixed(3),
      ndcg: result.ndcg.toFixed(3),
      latency: `${result.latencyMs.toFixed(2)} ms`,
    })),
  );

  console.log("\nRaw Results\n");

  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
