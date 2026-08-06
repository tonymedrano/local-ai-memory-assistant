import fs from "node:fs";
import path from "node:path";

import { LinearModel } from "./linear.model.js";
import type { StoredModel, LinearWeights } from "./model.types.js";

export class ModelRepository {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "data",
    "ltr-model.json",
  );

  load(): StoredModel | null {
    if (!fs.existsSync(ModelRepository.FILE_PATH)) {
      return null;
    }

    const content = fs.readFileSync(ModelRepository.FILE_PATH, "utf8");

    if (!content.trim()) {
      return null;
    }

    return JSON.parse(content) as StoredModel;
  }

  loadLinearModel(): LinearModel | null {
    const stored = this.load();

    if (!stored) {
      return null;
    }

    return new LinearModel(stored.weights as LinearWeights);
  }

  save(model: StoredModel): void {
    const directory = path.dirname(ModelRepository.FILE_PATH);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      ModelRepository.FILE_PATH,
      JSON.stringify(model, null, 2),
      "utf8",
    );
  }

  exists(): boolean {
    return fs.existsSync(ModelRepository.FILE_PATH);
  }

  delete(): void {
    if (this.exists()) {
      fs.unlinkSync(ModelRepository.FILE_PATH);
    }
  }
}
