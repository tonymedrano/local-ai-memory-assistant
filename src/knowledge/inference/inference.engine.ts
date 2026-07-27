import { getGraph } from "../graph/graph.service.js";

import { usesImpliesRequires } from "./inference.rules.js";

import type { DerivedKnowledge } from "./inference.types.js";

import { inferenceRepository } from "./inference.repository.js";

const rules = [usesImpliesRequires];

export function runInference(): DerivedKnowledge[] {
  const graph = getGraph();

  const results: DerivedKnowledge[] = [];

  for (const rule of rules) {
    const derived = rule.evaluate(graph);

    results.push(...derived);
  }

  inferenceRepository.add(results);

  return results;
}

export function getDerivedKnowledge(subject: string, relation?: string) {
  return inferenceRepository.find(subject, relation);
}
