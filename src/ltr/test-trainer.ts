import { LinearModel } from "./model/linear.model.js";
import { Trainer } from "./training/trainer.js";

const model = new LinearModel({
  semantic: 0.35,
  bm25: 0.2,
  importance: 0.15,
  confidence: 0.1,
  freshness: 0.1,
  graphEvidence: 0.05,
  accessCount: 0.03,
  diversity: 0.02,
  duplicatePenalty: -0.1,
});

const trainer = new Trainer(model);

console.log("Before");

console.table(model.getWeights());

trainer.train({
  target: 1,
  features: {
    semantic: 0.95,
    bm25: 0.7,
    importance: 0.9,
    confidence: 0.8,
    freshness: 0.95,
    graphEvidence: 0.3,
    accessCount: 0.4,
    diversity: 0.9,
    duplicatePenalty: 0,
  },
});

console.log("After");

console.table(model.getWeights());
