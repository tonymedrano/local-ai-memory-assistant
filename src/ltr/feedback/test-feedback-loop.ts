import { FeedbackRepository } from "./feedback.repository.js";
import { FeedbackService } from "./feedback.service.js";
import { FeedbackType } from "./feedback.types.js";

import { TrainingService } from "../training/training.service.js";

import { ModelRepository } from "../model/model.repository.js";

import { FeatureExtractor } from "../features/feature.extractor.js";

import { LinearModel } from "../model/linear.model.js";

import { DEFAULT_WEIGHTS } from "../model/default-weights.js";


async function main() {

  const feedbackRepository =
    new FeedbackRepository();


  const feedbackService =
    new FeedbackService(
      feedbackRepository,
    );


  const modelRepository =
    new ModelRepository();


  const before =
    modelRepository.load();


  console.log(
    "Model before:",
    before?.weights ?? DEFAULT_WEIGHTS,
  );


  const extractor =
    new FeatureExtractor();


  const features =
    extractor.extract({
      memory: {
        id: "memory-001",
        text: "Angular uses TypeScript",
        importance: 0.9,
        confidence: 0.8,
        createdAt: new Date().toISOString(),
      },

      metrics: {
        semantic: 0.9,
        bm25: 0.8,
        graphEvidence: 0.7,
      },
    });


  feedbackService.record({
    query: "Angular TypeScript",
    memoryId: "memory-001",
    type: FeedbackType.CLICK,
    features: features.features,
  });


  feedbackService.record({
    query: "Angular TypeScript",
    memoryId: "memory-001",
    type: FeedbackType.ACCEPT,
    features: features.features,
  });


  feedbackService.record({
    query: "Angular TypeScript",
    memoryId: "memory-001",
    type: FeedbackType.REJECT,
    features: features.features,
  });


  console.log(
    "Feedback count:",
    feedbackRepository.count(),
  );


  const trainingService =
    new TrainingService(
      feedbackRepository,
      modelRepository,
    );


  trainingService.train();


  const after =
    modelRepository.load();


  console.log(
    "Model after:",
    after,
  );


  if (!after) {
    throw new Error(
      "Model was not saved",
    );
  }


  console.log(
    "Feedback loop OK",
  );
}


main().catch(console.error);