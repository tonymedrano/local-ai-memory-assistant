import fs from "node:fs";
import path from "node:path";

import { config } from "../../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../../persistence/json.file.js";
import { LinearModel } from "./linear.model.js";
import type { StoredModel, LinearWeights } from "./model.types.js";

export class ModelRepository {
  constructor(
    private readonly filePath = path.join(config.dataDir, "ltr-model.json"),
  ) {}

  load(): StoredModel | null {
    return readJsonFileSync<StoredModel | null>(this.filePath, null);
  }

  loadLinearModel(): LinearModel | null {
    const stored = this.load();

    if (!stored) {
      return null;
    }

    return new LinearModel(stored.weights as LinearWeights);
  }

  save(model: StoredModel): void {
    writeJsonFileAtomicSync(this.filePath, model);
  }

  exists(): boolean {
    return fs.existsSync(this.filePath);
  }

  delete(): void {
    if (this.exists()) {
      fs.unlinkSync(this.filePath);
    }
  }
}
