import type { FeatureVector } from "../features/feature.types.js";
import type { FeatureWeights } from "../model/feature-weights.js";
import { GradientOptimizer } from "./gradient.optimizer.js";

const weights: FeatureWeights = {
  semantic: 0.50,
  bm25: 0.20,
  importance: 0.10,
  confidence: 0.30,
  freshness: 0.15,
  graphEvidence: 0.05,
  accessCount: 0.08,
  diversity: 0.12,
  duplicatePenalty: 0.02,

  feedbackScore: 0.10,
  retrievalFrequency: 0.15,
  ageScore: 0.05,
};

const features: FeatureVector = {
  semantic: 0.80,
  bm25: 0.60,
  importance: 0.40,
  confidence: 0.90,
  freshness: 0.70,
  graphEvidence: 0.50,
  accessCount: 0.30,
  diversity: 0.60,
  duplicatePenalty: 0.10,

  feedbackScore: 0.90,
  retrievalFrequency: 0.50,
  ageScore: 0.40,
};

const reward = 1;
const prediction = 0.40;
const error = reward - prediction;

console.log("\n=== BEFORE ===");
console.table(weights);

const updated = GradientOptimizer.updateWeights(
   weights,
  features,
  error,
  0.01,
);

console.log("\nError:", error.toFixed(4));

console.log("\n=== AFTER ===");
console.table(updated);

console.log("\n=== DELTA ===");

for (const key of Object.keys(weights) as (keyof FeatureVector)[]) {
  const before = weights[key]!;
  const after = updated[key]!;
  const delta = after - before;

  console.log(
    `${key.padEnd(20)} ${before.toFixed(4)} -> ${after.toFixed(4)} (${delta >= 0 ? "+" : ""}${delta.toFixed(4)})`,
  );
}