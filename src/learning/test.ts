import { LearningRepository } from "./learning.repository.js";
import { LearningService } from "./learning.service.js";
import { LearningEventType } from "./learning.types.js";

const repository = new LearningRepository();

const service = new LearningService(repository);

const memoryId = "angular-federation";

service.recordEvent({
  memoryId,
  event: LearningEventType.CONTEXT_USED,
  query: "Angular federation",
  currentScore: 0.75,
});

service.recordEvent({
  memoryId,
  event: LearningEventType.ANSWER_ACCEPTED,
  currentScore: 0.85,
});

console.log(repository.getAll());

console.log("Learning score:", service.calculateLearningScore(memoryId));
