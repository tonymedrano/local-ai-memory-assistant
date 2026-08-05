import type { FeatureVector } from "../features/feature.types.js";
import type { StoredModel } from "../model/model.types.js";
import { LearningRate } from "./online.learning-rate.js";
import { OnlineOptimizer } from "./online.optimizer.js";

const optimizer = new OnlineOptimizer(
  new LearningRate({
    initial: 0.1,
  }),
);

const model: StoredModel = {
  version: 1,
  trainedAt: new Date().toISOString(),
  samples: 100,
  weights: {
    semantic: 0.35,
    bm25: 0.2,
    importance: 0.15,
    confidence: 0.1,
    freshness: 0.1,
    graphEvidence: 0.05,
    accessCount: 0.03,
    diversity: 0.02,
    duplicatePenalty: -0.1,

    feedbackScore: 0.05,
    retrievalFrequency: 0.03,
    ageScore: 0.02,
  },
};

const features: FeatureVector = {
  semantic: 1,
  bm25: 0,
  importance: 0,
  confidence: 0,
  freshness: 0,
  graphEvidence: 0,
  accessCount: 0,
  diversity: 0,
  duplicatePenalty: 0,
  feedbackScore: 0,
  retrievalFrequency: 0,
  ageScore: 0,
};

console.log("ANTES");
console.table(model.weights);

const updated = optimizer.update(model, features, 1, 1);

console.log("DESPUÉS");
console.table(updated.weights);
