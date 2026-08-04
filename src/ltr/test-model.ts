import { FeatureExtractor } from "./features/feature.extractor.js";
import { LinearModel } from "./model/linear.model.js";

const extractor = new FeatureExtractor();

const model = new LinearModel({
  semantic: 0.40,
  bm25: 0.20,
  importance: 0.10,
  confidence: 0.10,
  freshness: 0.05,
  graphEvidence: 0.10,
  accessCount: 0.02,
  diversity: 0.03,
  duplicatePenalty: -0.20,
});

const ranked = extractor.extract({
  memory: {
    id: "memory-1",
    text: "Angular usa TypeScript",
    importance: 0.8,
    confidence: 0.9,
    accessCount: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,

  metrics: {
    semantic: 0.92,
    bm25: 0.64,
    graphEvidence: 0.35,
    diversity: 0.80,
    duplicatePenalty: 0,
  },
});

console.log("Features");
console.table(ranked.features);

const score = model.predict(ranked.features);

console.log();

console.log("Prediction");

console.log(score);