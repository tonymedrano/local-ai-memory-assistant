import { FeedbackService } from "../feedback/feedback.service.js";
import { AdaptiveWeightsService } from "./adaptive.weights.js";

export type ScoreIntent = "decision" | "architecture" | "code" | "general";

export interface ScoreInput {
  id?: string;
  similarity?: number;
  confidence?: number;
  importance?: number;
  accessCount?: number;
  updatedAt?: string;
  feedbackScore?: number;
  intent?: ScoreIntent;
}

export function calculateRelevanceScore(item: ScoreInput): number {
  const adaptiveWeights = new AdaptiveWeightsService();
  const feedbackService = new FeedbackService();
  const feedback = item.id ? feedbackService.calculateScore(item.id) : 0;
  const weights = adaptiveWeights.getWeights(item.intent ?? "general");
  const confidence = item.confidence ?? 0.5;
  const importance = item.importance ?? 0.5;
  const access = Math.min((item.accessCount ?? 0) / 10, 1);

  let freshness = 0.5;

  if (item.updatedAt) {
    const updated = new Date(item.updatedAt).getTime();
    const now = Date.now();
    const days = (now - updated) / (1000 * 60 * 60 * 24);
    freshness = Math.max(0, 1 - days / 30);
  }

  const score =
    (item.similarity ?? 0.5) * weights.similarity +
    confidence * weights.confidence +
    importance * weights.importance +
    access * 0.1 +
    freshness * weights.freshness +
    feedback * weights.feedback;

  return Number(score.toFixed(3));
}
