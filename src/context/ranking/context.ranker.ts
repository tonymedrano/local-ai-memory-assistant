import { calculateRelevanceScore } from "./relevance.score.js";

export interface RankedItem<T> {
  item: T;

  score: number;
}

export class ContextRanker {
  rank<T extends Record<string, any>>(items: T[]): RankedItem<T>[] {
    return items

      .map((item) => ({
        item,

        score: calculateRelevanceScore(item),
      }))

      .sort((a, b) => b.score - a.score);
  }
}

export const contextRanker = new ContextRanker();
