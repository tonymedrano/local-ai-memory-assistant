import { DEFAULT_WEIGHTS } from "./model/default-weights.js";
import { LinearModel } from "./model/linear.model.js";
import { Trainer } from "./training/trainer.js";

const model = new LinearModel(DEFAULT_WEIGHTS);

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
