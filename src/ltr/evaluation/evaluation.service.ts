import type {
  RetrievalPipelineResult,
} from "../../retrieval/retrieval.types.js";


export interface EvaluationPipeline {

  retrieve(
    request:{
      query:string;
      limit?:number;
    }
  ): Promise<RetrievalPipelineResult>;

}

import type { EvaluationDatasetRepository } from "./evaluation.dataset.repository.js";

import { EvaluationMetrics } from "./evaluation.metrics.js";

import { EvaluationRepository } from "./evaluation.repository.js";

import type { EvaluationResult } from "./evaluation.result.js";

export class EvaluationService {
  constructor(
    private readonly datasetRepository: EvaluationDatasetRepository,

    private readonly pipeline: EvaluationPipeline,

    private readonly metrics: EvaluationMetrics,

    private readonly repository: EvaluationRepository,
  ) {}

  async evaluate(k: number = 5): Promise<EvaluationResult> {
    const dataset = await this.datasetRepository.load();

    const queries = [];

    let precision = 0;
    let recall = 0;
    let mrr = 0;
    let ndcg = 0;

    for (const sample of dataset.samples) {
      const result = await this.pipeline.retrieve({
        query: sample.query,

        limit: k,
      });

      const retrieved = result.memories
        .map((item) => item.memory.id)
        .filter((id): id is string => id !== undefined);

      const relevant = Object.fromEntries(
        sample.expected.map((item) => [item.memoryId, item.label]),
      );

      const queryResult = {
        query: sample.query,

        retrieved,

        precisionAtK: this.metrics.precisionAtK(retrieved, relevant, k),

        recallAtK: this.metrics.recallAtK(retrieved, relevant, k),

        mrr: this.metrics.mrr(retrieved, relevant),

        ndcgAtK: this.metrics.ndcgAtK(retrieved, relevant, k),
      };

      queries.push(queryResult);

      precision += queryResult.precisionAtK;

      recall += queryResult.recallAtK;

      mrr += queryResult.mrr;

      ndcg += queryResult.ndcgAtK;
    }

    const count = dataset.samples.length;

    const evaluation: EvaluationResult = {
      evaluatedAt: new Date().toISOString(),

      samples: count,

      k,

      precisionAtK: precision / count,

      recallAtK: recall / count,

      mrr: mrr / count,

      ndcgAtK: ndcg / count,

      queries,
    };

    this.repository.save(evaluation);

    return evaluation;
  }
}
