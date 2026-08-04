import fs from "node:fs";
import path from "node:path";

import type { StoredModel } from "./model.types.js";

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

    return JSON.parse(content) as StoredModel;
  }

  save(model: StoredModel): void {
    const directory = path.dirname(this.file);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(this.file, JSON.stringify(model, null, 2), "utf8");
  }

  exists(): boolean {
    return fs.existsSync(this.file);
  }

  delete(): void {
    if (this.exists()) {
      fs.unlinkSync(this.file);
    }
  }
}
