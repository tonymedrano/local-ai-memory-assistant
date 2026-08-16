import { retrievalPipeline } from "../../core/container.js";

import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "../../retrieval/strategy/retrieval.strategy.selector.js";

import { EvaluationMetrics } from "./evaluation.metrics.js";
import { benchmarkDataset } from "./benchmark.dataset.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();
const metrics = new EvaluationMetrics();

async function evaluate(query: string, useAdaptiveStrategy: boolean) {
  const analysis = analyzer.analyze(query);

  const strategy = selector.select(analysis);

  const result = await retrievalPipeline.retrieve({
    query,
    limit: 5,
    options: {
      useLTR: true,

      ...(useAdaptiveStrategy
        ? {
            strategy,
          }
        : {}),
    },
  });

  return {
    results: result.memories
      .map((item) => item.memory.id)
      .filter((id): id is string => Boolean(id)),

    strategy: useAdaptiveStrategy ? strategy : undefined,

    analysis,
  };
}

function evaluateMetrics(retrieved: string[], expected: string[]) {
  const relevant: Record<string, number> = {};

  for (const id of expected) {
    relevant[id] = 1;
  }

  return {
    precisionAt5: metrics.precisionAtK(retrieved, relevant, 5),

    recallAt5: metrics.recallAtK(retrieved, relevant, 5),

    mrr: metrics.mrr(retrieved, relevant),

    ndcgAt5: metrics.ndcgAtK(retrieved, relevant, 5),
  };
}

for (const item of benchmarkDataset) {
  console.log("\n========================================");
  console.log("QUERY:", item.query);
  console.log("EXPECTED:", item.expected);

  // ------------------------------------
  // BASELINE
  // ------------------------------------

  const baseline = await evaluate(item.query, false);

  // ------------------------------------
  // ADAPTIVE
  // ------------------------------------

  const adaptive = await evaluate(item.query, true);

  // ------------------------------------
  // METRICS
  // ------------------------------------

  const baselineMetrics = evaluateMetrics(baseline.results, item.expected);

  const adaptiveMetrics = evaluateMetrics(adaptive.results, item.expected);

  // ------------------------------------
  // BASELINE
  // ------------------------------------

  console.log("\n--- BASELINE ---");

  console.log("RESULTS:", baseline.results);

  console.table(baselineMetrics);

  // ------------------------------------
  // ADAPTIVE
  // ------------------------------------

  console.log("\n--- ADAPTIVE ---");

  console.log("MODE:", adaptive.strategy?.mode);

  console.log("TOP K:", adaptive.strategy?.topK);

  console.log("VECTOR WEIGHT:", adaptive.strategy?.vectorWeight);

  console.log("KEYWORD WEIGHT:", adaptive.strategy?.keywordWeight);

  console.log("GRAPH WEIGHT:", adaptive.strategy?.graphWeight);

  console.log("GRAPH EVIDENCE WEIGHT:", adaptive.strategy?.graphEvidenceWeight);

  console.log("EXPAND QUERY:", adaptive.strategy?.expandQuery);

  console.log("RERANK:", adaptive.strategy?.rerank);

  console.log("RESULTS:", adaptive.results);

  console.table(adaptiveMetrics);

  // ------------------------------------
  // DELTA
  // ------------------------------------

  console.log("\n--- DELTA ---");

  console.table({
    precisionAt5: adaptiveMetrics.precisionAt5 - baselineMetrics.precisionAt5,

    recallAt5: adaptiveMetrics.recallAt5 - baselineMetrics.recallAt5,

    mrr: adaptiveMetrics.mrr - baselineMetrics.mrr,

    ndcgAt5: adaptiveMetrics.ndcgAt5 - baselineMetrics.ndcgAt5,
  });
}
