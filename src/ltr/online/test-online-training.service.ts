import type { FeatureVector } from "../features/feature.types.js";
import { ModelRepository } from "../model/model.repository.js";
import { LearningRate } from "./online.learning-rate.js";
import { OnlineOptimizer } from "./online.optimizer.js";
import { OnlineTrainer } from "./online.trainer.js";
import { OnlineTrainingService } from "./online.training.service.js";

const repository = new ModelRepository();

const optimizer = new OnlineOptimizer(
  new LearningRate()
);

const trainer = new OnlineTrainer(
  repository,
  optimizer
);

const service = new OnlineTrainingService(
  trainer
);

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

  // si existen
  feedbackScore: 0,
  retrievalFrequency: 0,
  ageScore: 0
};

await service.learn(features, 1);

const model = await repository.load();

if (!model) {
  throw new Error("Model not found");
}

console.table(model.weights);
console.log(model.samples);