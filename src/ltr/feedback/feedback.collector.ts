import { FeatureExtractor } from "../features/feature.extractor.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import { FeedbackType } from "./feedback.types.js";
import type { FeedbackLearningService } from "./feedback.learning.service.js";
import type { FeedbackScope } from "./feedback.types.js";

export class FeedbackCollector {
  constructor(
    private readonly feedbackService: FeedbackLearningService,
    private readonly featureExtractor: FeatureExtractor,
  ) {}

  async resultReturned(
    scope: FeedbackScope,
    query: string,
    results: RetrievalResult[],
  ): Promise<void> {
    for (const result of results) {
      if (!result.memory.id) {
        continue;
      }

      const ranked = this.featureExtractor.extract({
        memory: result.memory,
        metrics: {
          semantic: result.semanticScore ?? result.score ?? 0,
          bm25: result.keywordScore ?? 0,
          graphEvidence: result.graphScore ?? 0,
          diversity: result.diversityScore ?? 0,
          duplicatePenalty: result.duplicatePenalty ?? 0,
        },
      });

      await this.feedbackService.record(scope, {
        query,
        memoryId: result.memory.id,
        type: FeedbackType.IMPRESSION,
        features: ranked.features,
      });
    }
  }

  memorySelected(scope: FeedbackScope, query: string, result: RetrievalResult): void {
    if (!result.memory.id) {
      return;
    }

    const ranked = this.extract(result);

    this.feedbackService.record(scope, {
      query,
      memoryId: result.memory.id,
      type: FeedbackType.CLICK,
      features: ranked.features,
    });
  }

  contextUsed(scope: FeedbackScope, query: string, result: RetrievalResult): void {
    if (!result.memory.id) {
      return;
    }

    const ranked = this.extract(result);

    this.feedbackService.record(scope, {
      query,
      memoryId: result.memory.id,
      type: FeedbackType.ACCEPT,
      features: ranked.features,
    });
  }

  answerAccepted(scope: FeedbackScope, query: string, result: RetrievalResult): void {
    if (!result.memory.id) {
      return;
    }

    const ranked = this.extract(result);

    this.feedbackService.record(scope, {
      query,
      memoryId: result.memory.id,
      type: FeedbackType.ACCEPT,
      features: ranked.features,
    });
  }

  answerRejected(scope: FeedbackScope, query: string, result: RetrievalResult): void {
    if (!result.memory.id) {
      return;
    }

    const ranked = this.extract(result);

    this.feedbackService.record(scope, {
      query,
      memoryId: result.memory.id,
      type: FeedbackType.REJECT,
      features: ranked.features,
    });
  }

  private extract(result: RetrievalResult) {
    return this.featureExtractor.extract({
      memory: result.memory,
      metrics: {
        semantic: result.semanticScore ?? result.score ?? 0,
        bm25: result.keywordScore ?? 0,
        graphEvidence: result.graphScore ?? 0,
        diversity: result.diversityScore ?? 0,
        duplicatePenalty: result.duplicatePenalty ?? 0,
      },
    });
  }
}
