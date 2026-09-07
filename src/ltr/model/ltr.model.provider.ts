import type { ModelRepository } from "./model.repository.js";
import type { LTRModel } from "../training/ltr.model.js";
import { LinearModel } from "./linear.model.js";
import type { LTRModelProvider } from "./ltr.model.provider.interface.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";
import { DEFAULT_WEIGHTS } from "./default-weights.js";

export class PersistentLTRModelProvider implements LTRModelProvider {
  constructor(private repository: ModelRepository) {}

  getModel(scope: FeedbackScope): LTRModel {
    if (scope.kind !== "tenant") throw new Error("LTR runtime requires tenant scope");
    const stored = this.repository.loadScoped(scope);
    return new LinearModel(stored?.weights ?? DEFAULT_WEIGHTS);
  }
}
