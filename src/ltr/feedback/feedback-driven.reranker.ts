import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { LTRRankingResult } from "../ranking/ltr.ranker.js";
import type { FeedbackRepository } from "./feedback.repository.js";
import type { FeedbackScope } from "./feedback.types.js";

export interface FeedbackRerankingResult {
  result: RetrievalResult;
  score: number;
  feedbackBoost: number;
}

export class FeedbackDrivenReranker {
  constructor(
    private feedbackRepository: FeedbackRepository,
    private windowMinutes = 60,
  ) {}

  async rerank(
    scope: FeedbackScope,
    query: string,
    results: LTRRankingResult[],
  ): Promise<FeedbackRerankingResult[]> {
    const since = new Date(Date.now() - this.windowMinutes * 60 * 1000);

    if (scope.kind !== "tenant") throw new Error("Feedback reranking requires tenant scope");
    const feedback = await this.feedbackRepository.findSince(scope, since);

    return results
      .map((item) => {
        const memoryFeedback = feedback.filter(
          (f) => f.query === query && f.memoryId === item.result.memory.id,
        );

        const feedbackBoost = memoryFeedback.reduce(
          (total, current) => total + current.signal,
          0,
        );

        return {
          result: item.result,
          score: item.score + feedbackBoost,
          feedbackBoost,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
