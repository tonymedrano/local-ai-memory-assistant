import { adaptiveService } from "../adaptive/adaptive.service.js";
import { calculateRelevanceScore } from "./relevance.score.js";

export interface RankedItem<T> {
  item: T;

  score: number;
}

export class ContextRanker {
  rank<T extends Record<string, any>>(items: T[]): RankedItem<T>[] {
    return items
      .map((item) => {
        const relevance = calculateRelevanceScore(item);

        const score = adaptiveService.adaptScore(relevance, item.id);
        
        return {
          item,
          score: Math.min(1, score),
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}

export const contextRanker = new ContextRanker();
