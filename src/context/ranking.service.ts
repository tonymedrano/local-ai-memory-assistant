import { learningService } from "../core/container.js";
import type { RankingFactors, RankingResult } from "./ranking.types.js";
export class RankingService {
  rank(
    memoryId: string,
    factors: Omit<RankingFactors, "learning">,
  ): RankingResult {
    const learning = learningService.getLearningScore(memoryId);

    const rankingFactors = {
      ...factors,
      learning,
    };

    const base =
      rankingFactors.relevance *
      rankingFactors.confidence *
      rankingFactors.importance *
      rankingFactors.freshness;

    const finalScore = base * (1 + learning);

    return {
      score: Math.min(1, finalScore),

      factors: rankingFactors,
    };
  }
}
