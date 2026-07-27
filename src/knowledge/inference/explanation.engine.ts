import type { Explanation } from "./explanation.types.js";

import { inferenceRepository } from "./inference.repository.js";

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

  return {
    subject: derived.subject,

    relation: derived.relation,

    object: derived.object,

    conclusion: `${derived.subject} ${derived.relation} ${derived.object}`,

    reasoning: [
      "Derived from knowledge graph relation",

      "Applied inference rule: uses-implies-requires",
    ],

    evidence: derived.source,

    confidence: derived.confidence,

    createdAt: new Date().toISOString(),
  };
}
