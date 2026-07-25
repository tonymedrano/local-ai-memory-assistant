import type { Memory } from "./memory.types.js";

import { calculateMemoryScore } from "./memory-score.service.js";

export interface RankedMemory {
  similarity: number;

  memoryScore: number;

  finalScore: number;

  memory: Memory;
}

export function rankMemories(
  results: Array<{
    score: number;
    payload: Memory;
  }>,
): RankedMemory[] {
  return results
    .map((item) => {
      const memoryScore = calculateMemoryScore(item.payload);

      const finalScore = item.score * 0.7 + memoryScore * 0.3;

      return {
        similarity: Number(item.score.toFixed(3)),

        memoryScore,

        finalScore: Number(finalScore.toFixed(3)),

        memory: item.payload,
      };
    })

    .sort((a, b) => b.finalScore - a.finalScore);
}
