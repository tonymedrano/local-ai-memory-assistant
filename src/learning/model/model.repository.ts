import fs from "node:fs";
import path from "node:path";

import type { LinearWeights, StoredModel } from "./model.types.js";

export class ModelRepository {
  private readonly file = path.join(process.cwd(), "data", "ltr-model.json");

  load(): StoredModel | null {
    if (!fs.existsSync(this.file)) {
      return null;
    }

    const content = fs.readFileSync(this.file, "utf8");

    if (!content.trim()) {
      return null;
    }

    return JSON.parse(content);
  }

  save(model: StoredModel): void {
    fs.writeFileSync(this.file, JSON.stringify(model, null, 2));
  }
}
