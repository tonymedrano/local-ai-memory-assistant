import { FeatureExtractor } from "./features/feature.extractor.js";
import { FeedbackRepository } from "./feedback/feedback.repository.js";
import { FeedbackService } from "./feedback/feedback.service.js";
import { FeedbackType } from "./feedback/feedback.types.js";

const extractor = new FeatureExtractor();

const repository = new FeedbackRepository();

const service = new FeedbackService(repository);

const ranked = extractor.extract({
  memory: {
    id: "A",
    text: "Angular uses TypeScript",
    importance: 0.9,
    confidence: 0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 12,
  },
  metrics: {
    semantic: 0.92,
    bm25: 0.71,
    graphEvidence: 0.5,
    diversity: 0.8,
    duplicatePenalty: 0,
  },
});

service.record({
  query: "Angular",
  memoryId: ranked.memoryId,
  type: FeedbackType.ACCEPT,
  features: ranked.features,
});

console.table(repository.findAll());

console.log("Stored:", repository.count());
