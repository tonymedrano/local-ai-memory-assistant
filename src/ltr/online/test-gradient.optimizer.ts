import type { FeatureVector } from "../features/feature.types.js";
import type { FeatureWeights } from "../model/feature-weights.js";
import { GradientOptimizer } from "./gradient.optimizer.js";

const weights: FeatureWeights = {
  semantic: 0.5,
  bm25: 0.2,
  importance: 0.1,
  confidence: 0.3,
  freshness: 0.15,
  graphEvidence: 0.05,
  accessCount: 0.08,
  diversity: 0.12,
  duplicatePenalty: 0.02,

  feedbackScore: 0.1,
  retrievalFrequency: 0.15,
  ageScore: 0.05,
  contextScore: 0.8,
};

const features: FeatureVector = {
  semantic: 0.8,
  bm25: 0.6,
  importance: 0.4,
  confidence: 0.9,
  freshness: 0.7,
  graphEvidence: 0.5,
  accessCount: 0.3,
  diversity: 0.6,
  duplicatePenalty: 0.1,

  feedbackScore: 0.9,
  retrievalFrequency: 0.5,
  ageScore: 0.4,
  contextScore: 0.8,
};

const reward = 1;
const prediction = 0.4;
const error = reward - prediction;

console.log("\n=== BEFORE ===");
console.table(weights);

const updated = GradientOptimizer.updateWeights(weights, features, error, 0.01);

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

const featuresWithoutContext: FeatureVector = {
  semantic: 0.8,
  bm25: 0.6,
  importance: 0.4,
  confidence: 0.9,
  freshness: 0.7,
  graphEvidence: 0.5,
  accessCount: 0.3,
  diversity: 0.6,
  duplicatePenalty: 0.1,

  feedbackScore: 0.9,
  retrievalFrequency: 0.5,
  ageScore: 0.4,
};

const updatedWithoutContext = GradientOptimizer.updateWeights(
  weights,
  featuresWithoutContext,
  error,
  0.01,
);

if (Number.isNaN(updatedWithoutContext.contextScore)) {
  throw new Error("Gradient optimizer produced NaN for missing contextScore");
}

console.log("✓ missing optional contextScore handled safely");
