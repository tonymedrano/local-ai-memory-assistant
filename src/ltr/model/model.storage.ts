import fs from "fs";
import path from "path";

import type { StoredModel } from "./model.types.js";

export class ModelStorage {
  private readonly file = path.join(process.cwd(), "data", "ltr-model.json");

  load(): StoredModel | null {
    if (!fs.existsSync(this.file)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(this.file, "utf8")) as StoredModel;
  }

  save(model: StoredModel): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });

    fs.writeFileSync(this.file, JSON.stringify(model, null, 2));
  }
}
