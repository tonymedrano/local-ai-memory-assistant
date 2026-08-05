import { FeatureExtractor } from "./features/feature.extractor.js";

import { FeedbackCollector } from "./feedback/feedback.collector.js";
import { FeedbackRepository } from "./feedback/feedback.repository.js";
import { FeedbackService } from "./feedback/feedback.service.js";
import { FeedbackLearningService } from "./feedback/feedback.learning.service.js";

import { ModelRepository } from "./model/model.repository.js";

import { LearningRate } from "./online/online.learning-rate.js";
import { OnlineOptimizer } from "./online/online.optimizer.js";
import { OnlineTrainer } from "./online/online.trainer.js";
import { OnlineTrainingService } from "./online/online.training.service.js";

import type { RetrievalResult } from "../retrieval/types.js";


const repository = new FeedbackRepository();

const feedbackService = new FeedbackService(
  repository,
);


// Online Training

const modelRepository = new ModelRepository();

const optimizer = new OnlineOptimizer(
  new LearningRate(),
);

const trainer = new OnlineTrainer(
  modelRepository,
  optimizer,
);

const onlineTrainingService =
  new OnlineTrainingService(
    trainer,
  );


// Feedback Learning

const feedbackLearningService =
  new FeedbackLearningService(
    feedbackService,
    onlineTrainingService,
  );


// Collector

const collector = new FeedbackCollector(
  feedbackLearningService,
  new FeatureExtractor(),
);


const result: RetrievalResult = {
  memory: {
    id: "A",
    text: "Angular uses TypeScript",
    importance: 0.9,
    confidence: 0.8,
    accessCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  score: 0.91,

  semanticScore: 0.91,

  keywordScore: 0.72,

  graphScore: 0.55,

  diversityScore: 1,

  duplicatePenalty: 0,

  source: "hybrid",
};


collector.resultReturned(
  "Angular",
  [result],
);

collector.memorySelected(
  "Angular",
  result,
);

collector.contextUsed(
  "Angular",
  result,
);

collector.answerAccepted(
  "Angular",
  result,
);

collector.answerRejected(
  "Angular",
  result,
);


console.table(
  repository.findAll().map((item) => ({
    type: item.type,
    signal: item.signal,
    memoryId: item.memoryId,
    query: item.query,
  })),
);


console.log(
  "Stored:",
  repository.findAll().length,
);

await new Promise(
  resolve => setTimeout(resolve, 100)
);

const model = await modelRepository.load();

if (!model) {
  throw new Error("Model not found");
}

console.log("Model samples:", model.samples);

console.table(model.weights);