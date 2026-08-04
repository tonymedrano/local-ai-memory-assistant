import { FeatureExtractor } from "./features/feature.extractor.js";
import { FeedbackCollector } from "./feedback/feedback.collector.js";
import { FeedbackRepository } from "./feedback/feedback.repository.js";
import { FeedbackService } from "./feedback/feedback.service.js";

import type { RetrievalResult } from "../retrieval/types.js";

const repository = new FeedbackRepository();
const service = new FeedbackService(repository);

const collector = new FeedbackCollector(
  service,
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

console.log("Stored:", repository.findAll().length);