import {
  readJsonFileSync,
  writeJsonFileAtomicSync,
} from "../../persistence/json.file.js";
import type { LTRWeights } from "./ltr.model.js";

export class LTRModelStorage {
  constructor(private path: string) {}

  save(weights: LTRWeights) {
    const model = {
      version: 1,

      trainedAt: new Date().toISOString(),

      weights,
    };

    writeJsonFileAtomicSync(this.path, model);
  }

  load(): LTRWeights | null {
    const data = readJsonFileSync<{ weights: LTRWeights } | null>(
      this.path,
      null,
    );

    return data?.weights ?? null;
  }
}
