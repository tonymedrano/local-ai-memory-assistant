import { getGraph } from "../graph/graph.service.js";
import type { GraphScope } from "../graph/graph.types.js";

import { usesImpliesRequires } from "./inference.rules.js";

import { inferTwoHopRequires } from "./multihop.rules.js";

import type { DerivedKnowledge } from "./inference.types.js";

import { inferenceRepository } from "./inference.repository.js";

const rules = [
    usesImpliesRequires,
    {
        name: "two-hop-requires",
        evaluate: (graph: unknown, scope: GraphScope) =>
            inferTwoHopRequires(scope)
    }
];

export function runInference(scope: GraphScope): DerivedKnowledge[] {
  const graph = getGraph(scope);

  const results: DerivedKnowledge[] = [];

  for (const rule of rules) {
    const derived = rule.evaluate(graph, scope);

    results.push(...derived);
  }

  inferenceRepository.add(results);

  return results;
}

export function getDerivedKnowledge(subject: string, relation?: string) {
  return inferenceRepository.find(subject, relation);
}
