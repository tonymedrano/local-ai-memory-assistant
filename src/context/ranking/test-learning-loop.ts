import { FeedbackService } from "../feedback/feedback.service.js";
import { calculateRelevanceScore } from "./relevance.score.js";


const memoryId =
  "2b19c4a1-e9e8-419a-bbcf-3632f89e596a";


const feedback =
  new FeedbackService();


const memory = {
  id: memoryId,
  text: "Usamos Qdrant como base vectorial local",
  similarity: 0.9,
  confidence: 0.9,
  importance: 0.8,
  accessCount: 5,
  updatedAt: new Date().toISOString(),
};


console.log(
  "Before:",
  calculateRelevanceScore(memory),
);


await feedback.create({
  query: "¿Por qué usamos Qdrant?",
  memories: [memoryId],
  feedback: "positive",
  createdAt: new Date(),
});


console.log(
  "Feedback score:",
  feedback.calculateScore(memoryId),
);


console.log(
  "After:",
  calculateRelevanceScore(memory),
);


console.log(
  "Apply:",
  await feedback.applyFeedback(memoryId),
);