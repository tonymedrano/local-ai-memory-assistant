import { LTREvaluator } from "./evaluator.js";

import type { EvaluationQuery, EvaluationSummary } from "./evaluation.types.js";

export class DatasetEvaluator {
  private evaluator = new LTREvaluator();

  evaluate(
    dataset: EvaluationQuery[],
    rankings: Map<string, string[]>,
    k = 5,
  ): EvaluationSummary {
    let totals = {
      precisionAtK: 0,
      recallAtK: 0,
      mrr: 0,
      ndcgAtK: 0,
    };

    for (const item of dataset) {
      const results = rankings.get(item.query) ?? [];

      const metrics = this.evaluator.evaluate(results, item.relevant, k);

      totals.precisionAtK += metrics.precisionAtK;
      totals.recallAtK += metrics.recallAtK;
      totals.mrr += metrics.mrr;
      totals.ndcgAtK += metrics.ndcgAtK;
    }

    const count = dataset.length;

    return {
      precisionAtK: totals.precisionAtK / count,
      recallAtK: totals.recallAtK / count,
      mrr: totals.mrr / count,
      ndcgAtK: totals.ndcgAtK / count,
    };
  }
}
