import { retrievalPipeline } from "../../core/container.js";

import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import { StrategySelector } from "../../retrieval/intelligence/strategy.selector.js";

import { EvaluationMetrics } from "./evaluation.metrics.js";

import { benchmarkDataset } from "./benchmark.dataset.js";

const analyzer = new QueryAnalyzer();
const selector = new StrategySelector();
const metrics = new EvaluationMetrics();

async function evaluate(query: string, useAdaptiveStrategy: boolean) {
  const analysis = analyzer.analyze(query);

  const selection = selector.select({
    tokenCount: analysis.tokenCount,
    specificity: analysis.specificity,
    complexity: analysis.complexity,
    semanticIntent: analysis.semanticIntent,
  });

  const result = await retrievalPipeline.retrieve({
    query,
    limit: 5,
    options: {
      useLTR: true,
      ...(useAdaptiveStrategy
        ? {
            strategy: selection.strategy,
          }
        : {}),
    },
  });

  console.dir(result.memories, { depth: 5 });

  return {
    results: result.memories
      .map((item) => item.memory.id)
      .filter((id): id is string => Boolean(id)),

    strategy: useAdaptiveStrategy ? selection.strategy : undefined,

    reason: useAdaptiveStrategy ? selection.reason : undefined,
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

  const baseline = await evaluate(item.query, false);

  const adaptive = await evaluate(item.query, true);

  const baselineMetrics = evaluateMetrics(baseline.results, item.expected);

  const adaptiveMetrics = evaluateMetrics(adaptive.results, item.expected);

  console.log("\n--- BASELINE ---");

  console.log("RESULTS:", baseline.results);

  console.table(baselineMetrics);

  console.log("\n--- ADAPTIVE ---");

  console.log("STRATEGY:", adaptive.strategy?.name);

  console.log("CANDIDATE LIMIT:", adaptive.strategy?.candidateLimit);

  console.log("REASON:", adaptive.reason);

  console.log("RESULTS:", adaptive.results);

  console.table(adaptiveMetrics);

  console.log("\n--- DELTA ---");

  console.table({
    precisionAt5: adaptiveMetrics.precisionAt5 - baselineMetrics.precisionAt5,

    recallAt5: adaptiveMetrics.recallAt5 - baselineMetrics.recallAt5,

    mrr: adaptiveMetrics.mrr - baselineMetrics.mrr,

    ndcgAt5: adaptiveMetrics.ndcgAt5 - baselineMetrics.ndcgAt5,
  });
}
