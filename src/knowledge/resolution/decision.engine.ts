import type {
  ResolutionDecision,
  ResolutionScore,
} from "./resolution.types.js";

interface DecisionResult {
  decision: ResolutionDecision;

  accepted?: string;

  rejected?: string;

  reasoning: string[];
}

export function decideResolution(scores: ResolutionScore[]): DecisionResult {
  if (scores.length < 2) {
    return {
      decision: "uncertain",

      reasoning: ["Not enough evidence to resolve"],
    };
  }

  const sorted = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  const winner = sorted[0];

  const loser = sorted[1];

  const difference = Number((winner.totalScore - loser.totalScore).toFixed(2));

  if (difference < 0.05) {
    return {
      decision: "uncertain",

      reasoning: ["Evidence scores are too close"],
    };
  }

  return {
    decision: "keep",

    accepted: winner.knowledgeId,

    rejected: loser.knowledgeId,

    reasoning: [
      "Resolved using evidence ranking",
      `Winning score: ${winner.totalScore}`,
      `Score difference: ${difference}`,
    ],
  };
}
