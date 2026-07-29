import type { RankingWeights } from "./adaptive.types.js";

export type ContextIntent = "decision" | "architecture" | "code" | "general";

export class AdaptiveWeightsService {
  getWeights(intent: ContextIntent): RankingWeights {
    switch (intent) {
      case "decision":
        return {
          similarity: 0.25,
          importance: 0.35,
          confidence: 0.15,
          feedback: 0.2,
          freshness: 0.05,
        };

      case "architecture":
        return {
          similarity: 0.35,
          importance: 0.2,
          confidence: 0.2,
          feedback: 0.15,
          freshness: 0.1,
        };

      case "code":
        return {
          similarity: 0.45,
          importance: 0.1,
          confidence: 0.2,
          feedback: 0.1,
          freshness: 0.15,
        };

      default:
        return {
          similarity: 0.4,
          importance: 0.2,
          confidence: 0.2,
          feedback: 0.1,
          freshness: 0.1,
        };
    }
  }
}
