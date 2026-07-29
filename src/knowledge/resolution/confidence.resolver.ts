import type { ResolutionScore } from "./resolution.types.js";

export function compareConfidence(
  scores: ResolutionScore[],
): ResolutionScore | null {
  if (scores.length === 0) {
    return null;
  }

  return scores.sort((a, b) => b.totalScore - a.totalScore)[0];
}
