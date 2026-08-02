import { FeedbackBooster } from "./feedback.booster.js";

export class AdaptiveService {
  constructor(
    private readonly booster = new FeedbackBooster(),
  ) {}

  adaptScore(
    baseScore: number,
    memoryId: string,
  ): number {
    return this.booster.boost(
      baseScore,
      memoryId,
    );
  }
}

export const adaptiveService =
  new AdaptiveService();