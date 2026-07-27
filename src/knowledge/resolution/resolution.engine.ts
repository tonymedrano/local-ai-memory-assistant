import type { KnowledgeResolution } from "./resolution.types.js";
import { compareConfidence } from "./confidence.resolver.js";
import { rankEvidence } from "./evidence.ranker.js";
import { decideResolution } from "./decision.engine.js";

export function resolveConflict(conflict: {
  subject: string;
  object: string;
  relations: string[];
  evidence: string[];
}): KnowledgeResolution {
  const scores = rankEvidence([
    {
      knowledgeId: "angular-uses-typescript",

      confidence: 0.8,

      source: "documentation",

      createdAt: new Date().toISOString(),
    },

    {
      knowledgeId: "angular-not-uses-typescript",

      confidence: 0.9,

      source: "user",

      createdAt: new Date().toISOString(),
    },
  ]);

  const decision = decideResolution(scores);

  const winner = compareConfidence(scores);

  return {
    subject: conflict.subject,

    object: conflict.object,

    accepted: winner?.knowledgeId,

    ...decision,

    scores,

    reasoning: ["Resolved using confidence comparison"],

    createdAt: new Date().toISOString(),
  };
}
