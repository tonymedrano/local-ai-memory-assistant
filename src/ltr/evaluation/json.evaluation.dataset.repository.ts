import fs from "node:fs";
import path from "node:path";

import type { EvaluationDataset } from "./evaluation.types.js";

import type { EvaluationDatasetRepository } from "./evaluation.dataset.repository.js";

export class JsonEvaluationDatasetRepository implements EvaluationDatasetRepository {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "data",
    "ltr",
    "evaluation-dataset.json",
  );

  async load(): Promise<EvaluationDataset> {
    if (!fs.existsSync(JsonEvaluationDatasetRepository.FILE_PATH)) {
      throw new Error("Evaluation dataset not found");
    }

    const content = fs.readFileSync(
      JsonEvaluationDatasetRepository.FILE_PATH,
      "utf8",
    );

    if (!content.trim()) {
      throw new Error("Evaluation dataset is empty");
    }

    return JSON.parse(content) as EvaluationDataset;
  }

  async save(dataset: EvaluationDataset): Promise<void> {
    const directory = path.dirname(JsonEvaluationDatasetRepository.FILE_PATH);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      JsonEvaluationDatasetRepository.FILE_PATH,

      JSON.stringify(dataset, null, 2),

      "utf8",
    );
  }
}
