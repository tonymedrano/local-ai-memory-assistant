import { ModelRepository } from "./model/model.repository.js";

const repository = new ModelRepository();

repository.delete();

repository.save({
  version: 1,
  trainedAt: new Date().toISOString(),
  samples: 42,
  weights: {
    semantic: 0.5,
    bm25: 0.2,
    importance: 0.1,
    confidence: 0.1,
    freshness: 0.05,
    graphEvidence: 0.03,
    accessCount: 0.01,
    diversity: 0.01,
    duplicatePenalty: -0.1,
  },
});

const model = repository.load();

if (!model) {
  throw new Error("Model not found");
}

console.log("Version:", model.version);
console.log("Samples:", model.samples);
console.log("Trained:", model.trainedAt);

console.table(model.weights);