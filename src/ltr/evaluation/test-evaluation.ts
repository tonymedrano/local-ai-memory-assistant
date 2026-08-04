import { LTREvaluator } from "./evaluator.js";

const evaluator = new LTREvaluator();

const results = ["memory-001", "memory-003", "memory-002", "memory-004"];

const relevance = {
  "memory-001": 3,
  "memory-002": 2,
  "memory-005": 1,
};

console.table(evaluator.evaluate(results, relevance, 4));
