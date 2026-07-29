import { explain } from "../../knowledge/inference/explanation.engine.js";
import type { Explanation } from "../../knowledge/inference/explanation.types.js";
import type { DerivedKnowledge } from "../../knowledge/inference/inference.types.js";

export class ExplanationProvider {
  search(inference: DerivedKnowledge[]): Explanation[] {
    return inference
      .map((item) => explain(item.subject, item.relation, item.object))
      .filter((item): item is Explanation => item !== null);
  }
}
