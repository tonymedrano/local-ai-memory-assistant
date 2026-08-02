import { FeedbackService } from "../feedback/feedback.service.js";
import { FeedbackBooster } from "../adaptive/feedback.booster.js";

const feedback = new FeedbackService();

const booster = new FeedbackBooster();

const memoryId = "memory-qdrant";

feedback.create({
  query: "¿Por qué usamos Qdrant?",
  memories: [memoryId],
  feedback: "positive",
  createdAt: new Date(),
});

const score = booster.boost(0.7, memoryId);

console.log({
  base: 0.7,
  boosted: score,
});
