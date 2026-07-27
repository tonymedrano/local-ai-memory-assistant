import type { InferenceRule, DerivedKnowledge } from "./inference.types.js";

export const usesImpliesRequires: InferenceRule = {
  name: "uses-implies-requires",

  description: "If A uses B, infer A requires B",

  evaluate(graph: any): DerivedKnowledge[] {
    const results: DerivedKnowledge[] = [];

    for (const edge of graph.edges) {
      if (edge.relation !== "uses") {
        continue;
      }

      results.push({
        subject: edge.source,

        relation: "requires",

        object: edge.target,

        confidence: Number((edge.confidence * 0.9).toFixed(2)),

        source: [edge.id],

        createdAt: new Date().toISOString(),
      });
    }

    return results;
  },
};
