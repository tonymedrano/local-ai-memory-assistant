import { store } from "../../memory/memory.service.js";
import { MemoryType } from "../../memory/memory.types.js";

import { FeedbackService } from "./feedback.service.js";

const feedbackService = new FeedbackService();

const memory = await store({
  text: "Usamos Qdrant como base vectorial local",
  type: MemoryType.DECISION,
});

console.log("Created memory:", memory.id);

feedbackService.create({
  query: "¿Por qué usamos Qdrant?",
  memories: [String(memory.id)],
  feedback: "positive",
  createdAt: new Date(),
});

feedbackService.create({
  query: "¿Por qué usamos Angular?",
  memories: [String(memory.id)],
  feedback: "positive",
  createdAt: new Date(),
});

console.log(JSON.stringify(feedbackService.getAll(), null, 2));
console.log("Score:", feedbackService.calculateScore(String(memory.id)));
console.log(await feedbackService.applyFeedback(String(memory.id)));
