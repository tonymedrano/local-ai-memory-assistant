import type { EvaluationDataset } from "./evaluation.types.js";

export interface EvaluationDatasetRepository {
  load(): Promise<EvaluationDataset>;

  save(dataset: EvaluationDataset): Promise<void>;
}
