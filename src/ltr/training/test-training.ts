import { DatasetLoader } from "./dataset.loader.js";

import { LTRTrainer } from "./ltr.trainer.js";

import { LinearLTRModel } from "./ltr.linear.model.js";

import { LTRModelStorage } from "./ltr.model.storage.js";

const loader = new DatasetLoader("data/ltr/training-dataset.jsonl");

const dataset = loader.load();

console.log("\nSamples:", dataset.length);

const trainer = new LTRTrainer();

const weights = trainer.train(dataset);

console.log("\nWeights:", weights);

const model = new LinearLTRModel(weights);

console.log(
  "\nPrediction memory-001:",
  model.predict({
    semantic: 0.92,
    bm25: 0.81,
    importance: 0.7,
  }),
);

console.log(
  "Prediction memory-002:",
  model.predict({
    semantic: 0.35,
    bm25: 0.22,
    importance: 0.4,
  }),
);

const storage = new LTRModelStorage("data/ltr/model.json");

storage.save(weights);

console.log("\nModel saved");
