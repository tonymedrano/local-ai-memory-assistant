import { precisionAtK, recallAtK, reciprocalRank, ndcgAtK } from "./metrics.js";

export class LTREvaluator {
  evaluate(results: string[], relevance: Record<string, number>, k = 5) {
    const relevant = new Set(
      Object.keys(relevance).filter((id) => relevance[id] > 0),
    );

    return {
      precisionAtK: precisionAtK(results, relevant, k),
      recallAtK: recallAtK(results, relevant, k),
      mrr: reciprocalRank(results, relevant),
      ndcgAtK: ndcgAtK(results, relevance, k),
    };
  }
}
