import path from "node:path";

import { config } from "../../config.js";
import {
  readJsonFileSync,
  writeJsonFileAtomicSync,
} from "../../persistence/json.file.js";
import type { StoredModel } from "./model.types.js";

export class ModelRepository {
  constructor(
    private readonly file = path.join(config.dataDir, "ltr-model.json"),
  ) {}

  load(): StoredModel | null {
    return readJsonFileSync<StoredModel | null>(this.file, null);
  }

  save(model: StoredModel): void {
    writeJsonFileAtomicSync(this.file, model);
  }
}
