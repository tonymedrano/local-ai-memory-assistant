import { RankingService } from "./ranking.service.js";
import { LearningRepository } from "../learning/learning.repository.js";
import { LearningService } from "../learning/learning.service.js";
import { LearningEventType } from "../learning/learning.types.js";

const repository = new LearningRepository();

const learning = new LearningService(repository);

const memoryId = "angular-federation";

learning.recordEvent({
  memoryId,
  event: LearningEventType.CONTEXT_USED,
  currentScore: 0.7,
});

learning.recordEvent({
  memoryId,
  event: LearningEventType.ANSWER_ACCEPTED,
  currentScore: 0.8,
});

const ranking = new RankingService(learning);

console.log(
  ranking.rank(memoryId, {
    relevance: 0.9,
    confidence: 0.8,
    importance: 0.8,
    freshness: 0.9,
  }),
);
