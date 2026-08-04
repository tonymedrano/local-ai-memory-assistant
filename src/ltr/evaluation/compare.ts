import { DatasetEvaluator } from "./dataset.evaluator.js";
import { improvement } from "./improvement.js";

const dataset = [
  {
    query: "angular federation",

    relevant: {
      "memory-001": 3,
      "memory-002": 1,
    },
  },
];

const baseline = new Map<string, string[]>([
  ["angular federation", ["memory-002", "memory-003", "memory-001"]],
]);

const ltr = new Map<string, string[]>([
  ["angular federation", ["memory-001", "memory-002", "memory-003"]],
]);

const evaluator = new DatasetEvaluator();

const baselineMetrics = evaluator.evaluate(dataset, baseline);
const ltrMetrics = evaluator.evaluate(dataset, ltr);

console.log("BASELINE");
console.table(baselineMetrics);

console.log("LTR");
console.table(ltrMetrics);

console.log("IMPROVEMENTS");
console.table({
  precisionAtK: improvement(
    baselineMetrics.precisionAtK,
    ltrMetrics.precisionAtK,
  ),
  recallAtK: improvement(baselineMetrics.recallAtK, ltrMetrics.recallAtK),
  mrr: improvement(baselineMetrics.mrr, ltrMetrics.mrr),
  ndcgAtK: improvement(baselineMetrics.ndcgAtK, ltrMetrics.ndcgAtK),
});
