import type { KnowledgeResolution } from "./resolution.types.js";

import { rankEvidence } from "./evidence.ranker.js";

import { decideResolution } from "./decision.engine.js";

import { resolutionStorage } from "./resolution.storage.js";

export function resolveAndStore(conflict: {
  subject: string;

  object: string;

  evidence: {
    knowledgeId: string;

    confidence: number;

    source?: string;

    createdAt?: string;
  }[];
}): KnowledgeResolution {
  const scores = rankEvidence(conflict.evidence);

  const decision = decideResolution(scores);

  const resolution: KnowledgeResolution = {
    subject: conflict.subject,

    object: conflict.object,

    accepted: decision.accepted,

    rejected: decision.rejected,

    decision: decision.decision,

    scores,

    reasoning: decision.reasoning,

    createdAt: new Date().toISOString(),
  };

  resolutionStorage.add(resolution);

  return resolution;
}
