import { contextLearningJob } from "./context-learning.job.js";
import { learningService } from "../core/container.js";
import { LearningEventType } from "../learning/learning.types.js";
import { initLearning } from "../core/container.js";

await initLearning();

learningService.recordEvent({
  memoryId: "2b19c4a1-e9e8-419a-bbcf-3632f89e596a",
  event: LearningEventType.CONTEXT_USED,
  currentScore: 0.7,
});

learningService.recordEvent({
  memoryId: "2b19c4a1-e9e8-419a-bbcf-3632f89e596a",
  event: LearningEventType.ANSWER_ACCEPTED,
  currentScore: 0.8,
});

console.log("Starting test...");

await contextLearningJob();

console.log("Finished test...");
