import { LabelGenerator } from "./label.generator.js";
import {
  FeedbackType,
  type RankingFeedback,
} from "../feedback/feedback.types.js";

const feedback: RankingFeedback = {
  id: "1",
  query: "angular federation",
  memoryId: "memory-001",
  type: FeedbackType.ACCEPT,
  signal: 1,
  createdAt: new Date(),
  features: {
    semantic: 0.92,
    bm25: 0.81,
    importance: 0.70,
    confidence: 0.90,
    freshness: 0.95,
    graphEvidence: 0.61,
    accessCount: 0.42,
    diversity: 0.84,
    duplicatePenalty: 0.05,
  },
};

const label = new LabelGenerator().generate(feedback);

console.table(label);