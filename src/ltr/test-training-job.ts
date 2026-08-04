import { FeedbackRepository } from "./feedback/feedback.repository.js";
import { FeedbackService } from "./feedback/feedback.service.js";
import { FeedbackType } from "./feedback/feedback.types.js";
import { ModelRepository } from "./model/model.repository.js";
import { TrainingJob } from "./training/training.job.js";
import { TrainingService } from "./training/training.service.js";

const feedbackRepository = new FeedbackRepository();

const feedbackService = new FeedbackService(feedbackRepository);

feedbackService.record({
  query: "Angular",

  memoryId: "A",

  type: FeedbackType.ACCEPT,

  features: {
    semantic: 0.9,
    bm25: 0.8,
    importance: 0.7,
    confidence: 0.8,
    freshness: 0.9,
    graphEvidence: 0.4,
    accessCount: 0.3,
    diversity: 0.6,
    duplicatePenalty: 0,
  },
});

const trainingService = new TrainingService(
  feedbackRepository,
  new ModelRepository(),
);

const job = new TrainingJob(trainingService);

await job.run();

const model = new ModelRepository().load();

console.log("Samples:", model?.samples);

console.table(model?.weights);
