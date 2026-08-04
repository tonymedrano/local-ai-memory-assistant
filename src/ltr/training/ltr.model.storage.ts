import fs from "node:fs";
import type { LTRWeights } from "./ltr.model.js";

export class LTRModelStorage {
  constructor(private path: string) {}

  save(weights: LTRWeights) {
    const model = {
      version: 1,

      trainedAt: new Date().toISOString(),

      weights,
    };

    fs.writeFileSync(
      this.path,

      JSON.stringify(model, null, 2),
    );
  }

  load(): LTRWeights | null {
    if (!fs.existsSync(this.path)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(this.path, "utf-8"));

    return data.weights;
  }
}
