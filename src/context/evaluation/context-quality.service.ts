import type { ContextResult } from "../context.types.js";
import { FeedbackService } from "../feedback/feedback.service.js";

import type { ContextQualityReport } from "./quality.types.js";

const feedbackService = new FeedbackService();

export class ContextQualityService {
  evaluate(
    context: ContextResult,
    queryMemories: string[],
  ): ContextQualityReport {
    const memoriesUsed = context.memories.length;
    const knowledgeUsed = context.knowledge.length;
    const relevance = this.calculateRelevance(context);
    const feedback = this.calculateFeedback(queryMemories);
    const sizePenalty = this.calculateSizePenalty(context);
    const score = Number(
      (relevance * 0.5 + feedback * 0.3 + sizePenalty * 0.2).toFixed(3),
    );

    return {
      score,
      relevance,
      feedback,
      sizePenalty,
      memoriesUsed,
      knowledgeUsed,
      recommendations: this.recommendations(score, feedback),
    };
  }

  private calculateRelevance(context: ContextResult) {
    if (!context.memories.length) {
      return 0;
    }

    const total = context.memories.reduce((sum, item) => sum + item.score, 0);

    return Number((total / context.memories.length).toFixed(3));
  }

  private calculateFeedback(memoryIds: string[]) {
    if (!memoryIds.length) {
      return 0;
    }

    const scores = memoryIds.map((id) => feedbackService.calculateScore(id));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    return Number(((avg + 1) / 2).toFixed(3));
  }

  private calculateSizePenalty(context: ContextResult) {
    const total =
      context.memories.length +
      context.knowledge.length +
      context.inference.length;

    if (total <= 5) {
      return 1;
    }

    return Number(Math.max(0, 1 - (total - 5) / 20).toFixed(3));
  }

  private recommendations(score: number, feedback: number,) {
    const result: string[] = [];

    if (score < 0.5) {
      result.push("Increase context relevance");
    }

    if (score >= 0.8) {
      result.push("Context quality is good");
    }

    if (feedback === 0.5) {
      result.push("No feedback history available");
    }

    return result;
  }
}
