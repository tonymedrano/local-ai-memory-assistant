import { calculateRelevanceScore } from "./relevance.score.js";

import { FeedbackService } from "../feedback/feedback.service.js";

const feedback = new FeedbackService();

const memoryId = "2b19c4a1-e9e8-419a-bbcf-3632f89e596a";

console.log(
  "Antes:",
  calculateRelevanceScore({
    id: memoryId,
    similarity: 0.8,
    confidence: 0.8,
    importance: 0.8,
    accessCount: 5,
    updatedAt: new Date().toISOString(),
  }),
);

await feedback.create({
  query: "¿Por qué usamos Qdrant?",
  memories: [memoryId],
  feedback: "positive",
  createdAt: new Date(),
});

console.log(
  "Después:",
  calculateRelevanceScore({
    id: memoryId,
    similarity: 0.8,
    confidence: 0.8,
    importance: 0.8,
    accessCount: 5,
    updatedAt: new Date().toISOString(),
  }),
);
