import type { ModelRepository } from "./model.repository.js";
import type { LTRModel } from "../training/ltr.model.js";
import { LinearModel } from "./linear.model.js";
import type { LTRModelProvider } from "./ltr.model.provider.interface.js";

export class PersistentLTRModelProvider implements LTRModelProvider {
  constructor(private repository: ModelRepository) {}

  getModel(): LTRModel {
    const stored = this.repository.load();

    if (!stored) {
      throw new Error("LTR model not found");
    }

    return new LinearModel(stored.weights);
  }
}
