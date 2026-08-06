import fs from "node:fs";
import path from "node:path";

import type { EvaluationResult } from "./evaluation.result.js";

export class EvaluationRepository {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "data",
    "ltr",
    "evaluation-result.json",
  );

  save(result: EvaluationResult): void {
    const directory = path.dirname(EvaluationRepository.FILE_PATH);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      EvaluationRepository.FILE_PATH,
      JSON.stringify(result, null, 2),
      "utf8",
    );
  }

  loadLatest(): EvaluationResult | null {
    if (!fs.existsSync(EvaluationRepository.FILE_PATH)) {
      return null;
    }

    const content = fs.readFileSync(EvaluationRepository.FILE_PATH, "utf8");

    if (!content.trim()) {
      return null;
    }

    return JSON.parse(content) as EvaluationResult;
  }
}
