import type { Explanation } from "./explanation.types.js";

import { inferenceRepository } from "./inference.repository.js";

import { graphRepository } from "../graph/graph.repository.js";
import { graphScopeKey, type GraphScope } from "../graph/graph.types.js";

export function explain(
  scope: GraphScope,
  subject: string,
  relation: string,
  object: string,
): Explanation | null {
  const derived = inferenceRepository
    .find(subject, relation)
    .find((item) => item.object === object);

  if (!derived) {
    return null;
  }

  const subjectLabel = derived.subjectLabel ?? subject;

  const objectLabel = derived.objectLabel ?? object;

  const evidence = derived.source.map((edgeId): string | null => {
    const edge = graphRepository.getGraph(scope).edges.find((e) => e.id === edgeId);

    if (!edge) {
      return null;
    }

    if (graphScopeKey(edge.scope) !== graphScopeKey(scope)) return null;

    const source = graphRepository.getNode(scope, edge.source);

    const target = graphRepository.getNode(scope, edge.target);

    if (!source || !target || graphScopeKey(source.scope) !== graphScopeKey(scope) || graphScopeKey(target.scope) !== graphScopeKey(scope)) {
      return null;
    }

    return `${source?.label ?? edge.source} ${edge.relation} ${target?.label ?? edge.target}`;
  });

  if (evidence.some((item) => item === null)) return null;

  return {
    subject: subjectLabel,

    relation: derived.relation,

    object: objectLabel,

    conclusion: `${subjectLabel} ${relation} ${objectLabel}`,

    reasoning: [
      "Derived from knowledge graph relations",

      "Applied inference rule: uses-implies-requires",

      ...evidence.map((item) => `Evidence: ${item!}`),
    ],

    evidence: derived.source,

    confidence: derived.confidence,

    createdAt: new Date().toISOString(),
  };
}
