import { existsSync } from "node:fs";
import path from "node:path";

import { config } from "../../config.js";
import {
  readJsonFileSync,
  writeJsonFileAtomicSync,
} from "../../persistence/json.file.js";
import type { EvaluationDataset } from "./evaluation.types.js";

import type { EvaluationDatasetRepository } from "./evaluation.dataset.repository.js";

export class JsonEvaluationDatasetRepository implements EvaluationDatasetRepository {
  constructor(
    private readonly filePath = path.join(
      config.dataDir,
      "ltr",
      "evaluation-dataset.json",
    ),
  ) {}

  async load(): Promise<EvaluationDataset> {
    if (!existsSync(this.filePath)) {
      throw new Error("Evaluation dataset not found");
    }

    const dataset = readJsonFileSync<EvaluationDataset | undefined>(
      this.filePath,
      undefined,
    );

    if (!dataset) {
      throw new Error("Evaluation dataset is empty");
    }

    return dataset;
  }

  async save(dataset: EvaluationDataset): Promise<void> {
    writeJsonFileAtomicSync(this.filePath, dataset);
  }
}
