import { FeatureExtractor } from "./feature.extractor.js";

const extractor = new FeatureExtractor();

const result = extractor.extract({
  memory: {
    id: "memory-001",
    text: "Angular uses TypeScript for frontend development",
    importance: 0.9,
    confidence: 0.85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 50,
  },

  metrics: {
    semantic: 0.92,
    bm25: 0.74,
    graphEvidence: 0.5,
    diversity: 0.8,
    duplicatePenalty: 0.1,
    feedbackScore: 0.7,
  },
});

console.log("Memory:", result.memoryId);

console.table(result.features);
