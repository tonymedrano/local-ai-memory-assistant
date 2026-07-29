import type { ResolutionScore } from "./resolution.types.js";

interface EvidenceInput {
  knowledgeId: string;

  confidence: number;

  source?: string;

  createdAt?: string;
}

const sourceWeights: Record<string, number> = {
  documentation: 1,

  system: 0.9,

  user: 0.7,

  unknown: 0.5,
};

function getSourceScore(source?: string): number {
  if (!source) {
    return sourceWeights.unknown;
  }

  return sourceWeights[source] ?? sourceWeights.unknown;
}

function getRecencyScore(createdAt?: string): number {
  if (!createdAt) {
    return 0.5;
  }

  const age = Date.now() - new Date(createdAt).getTime();

  const days = age / (1000 * 60 * 60 * 24);

  if (days < 7) {
    return 1;
  }

  if (days < 30) {
    return 0.8;
  }

  return 0.5;
}

export function rankEvidence(evidences: EvidenceInput[]): ResolutionScore[] {
  return evidences.map((evidence) => {
    const sourceScore = getSourceScore(evidence.source);

    const recencyScore = getRecencyScore(evidence.createdAt);

    const totalScore = Number(
      (
        evidence.confidence * 0.6 +
        sourceScore * 0.3 +
        recencyScore * 0.1
      ).toFixed(2),
    );

    return {
      knowledgeId: evidence.knowledgeId,

      confidence: evidence.confidence,

      sourceScore,

      recencyScore,

      totalScore,
    };
  });
}
