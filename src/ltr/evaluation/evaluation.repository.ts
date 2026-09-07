import path from "node:path";

import { config } from "../../config.js";
import {
  readJsonFileSync,
  writeJsonFileAtomicSync,
} from "../../persistence/json.file.js";
import type { EvaluationResult } from "./evaluation.result.js";

export class EvaluationRepository {
  constructor(
    private readonly filePath = path.join(
      config.dataDir,
      "ltr",
      "evaluation-result.json",
    ),
  ) {}

  save(result: EvaluationResult): void {
    writeJsonFileAtomicSync(this.filePath, result);
  }

  loadLatest(): EvaluationResult | null {
    return readJsonFileSync<EvaluationResult | null>(this.filePath, null);
  }
}
