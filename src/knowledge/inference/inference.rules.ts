import type { InferenceRule, DerivedKnowledge } from "./inference.types.js";
import { graphScopeKey, type GraphScope } from "../graph/graph.types.js";

export const usesImpliesRequires: InferenceRule = {
  name: "uses-implies-requires",

  description: "If A uses B, infer A requires B",

  evaluate(graph: any, scope: GraphScope): DerivedKnowledge[] {
    const results: DerivedKnowledge[] = [];

    for (const edge of graph.edges) {
      if (edge.relation !== "uses") {
        continue;
      }

      if (edge.scope && graphScopeKey(edge.scope) !== graphScopeKey(scope)) {
        continue;
      }

      const subjectNode = graph.nodes.find(
        (node: any) => node.id === edge.source,
      );

      const objectNode = graph.nodes.find(
        (node: any) => node.id === edge.target,
      );

      if ((subjectNode?.scope && graphScopeKey(subjectNode.scope) !== graphScopeKey(scope)) ||
          (objectNode?.scope && graphScopeKey(objectNode.scope) !== graphScopeKey(scope))) {
        continue;
      }

      results.push({
        subject: edge.source,

        subjectLabel: subjectNode?.label ?? edge.source,

        relation: "requires",

        object: edge.target,

        objectLabel: objectNode?.label ?? edge.target,

        confidence: Number((edge.confidence * 0.9).toFixed(2)),

        source: [edge.id],

        createdAt: new Date().toISOString(),
      });
    }

    return results;
  },
};
