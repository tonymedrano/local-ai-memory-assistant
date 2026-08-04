import { FeedbackService } from "../ltr/feedback/feedback.service.js";
import { FeedbackType } from "../ltr/feedback/feedback.types.js";

import { FeatureExtractor } from "../ltr/features/feature.extractor.js";

import {
  feedbackRepository,
  feedbackService,
  trainingService,
  modelRepository,
} from "../core/container.js";

async function main() {
  console.log("=== LTR Training Job Test ===");

  const before = modelRepository.load();

  console.log("Model before samples:", before?.samples ?? 0);

  const extractor = new FeatureExtractor();

  const extracted = extractor.extract({
    memory: {
      id: "test-memory",
      text: "Angular Native Federation uses sp-shell",
      importance: 0.9,
      confidence: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 10,
    },

    metrics: {
      semantic: 0.95,
      bm25: 0.8,
      graphEvidence: 0.7,
      diversity: 0.9,
      duplicatePenalty: 0,
    },
  });

  feedbackService.record({
    query: "Angular Native Federation",
    memoryId: "test-memory",
    type: FeedbackType.CLICK,
    features: extracted.features,
  });

  for (let i = 0; i < 12; i++) {
    feedbackService.record({
      query: "Angular Native Federation",
      memoryId: `test-memory-${i}`,
      type: i % 3 === 0 ? FeedbackType.ACCEPT : FeedbackType.CLICK,
      features: extracted.features,
    });
  }

  console.log("Feedback samples:", feedbackRepository.count());

  await trainingService.train();

  const after = modelRepository.load();

  console.log("Model after samples:", after?.samples ?? 0);

  console.log("Training timestamp:", after?.trainedAt);

  if (!after) {
    throw new Error("LTR model was not saved");
  }

  if (!after.weights || Object.keys(after.weights).length === 0) {
    throw new Error("LTR weights are empty");
  }

  console.log("LTR Automatic Training Job OK");
}

main().catch(console.error);
