import type { Explanation } from "./explanation.types.js";

import { inferenceRepository } from "./inference.repository.js";

import { graphRepository } from "../graph/graph.repository.js";

export function explain(
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

  const evidence = derived.source.map((edgeId) => {
    const edge = graphRepository.getGraph().edges.find((e) => e.id === edgeId);

    if (!edge) {
      return edgeId;
    }

    const source = graphRepository.getNode(edge.source);

    const target = graphRepository.getNode(edge.target);

    return `${source?.label ?? edge.source} ${edge.relation} ${target?.label ?? edge.target}`;
  });

  return {
    subject: subjectLabel,

    relation: derived.relation,

    object: objectLabel,

    conclusion: `${subjectLabel} ${relation} ${objectLabel}`,

    reasoning: [
      "Derived from knowledge graph relations",

      "Applied inference rule: uses-implies-requires",

      ...evidence.map((item) => `Evidence: ${item}`),
    ],

    evidence: derived.source,

    confidence: derived.confidence,

    createdAt: new Date().toISOString(),
  };
}
