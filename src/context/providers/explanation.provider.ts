import { explain } from "../../knowledge/inference/explanation.engine.js";
import type { Explanation } from "../../knowledge/inference/explanation.types.js";
import type { DerivedKnowledge } from "../../knowledge/inference/inference.types.js";
import type { GraphScope } from "../../knowledge/graph/graph.types.js";

export class ExplanationProvider {
  search(scope: GraphScope, inference: DerivedKnowledge[]): Explanation[] {
    return inference
      .map((item) => explain(scope, item.subject, item.relation, item.object))
      .filter((item): item is Explanation => item !== null);
  }
}
