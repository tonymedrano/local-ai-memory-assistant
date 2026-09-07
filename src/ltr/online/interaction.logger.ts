import { InteractionRepository } from "./interaction.repository.js";
import type { InteractionType } from "./interaction.types.js";

export class InteractionLogger {
  constructor(
    private readonly repository: InteractionRepository
  ) {}

  log(
    query: string,
    memoryId: string,
    rank: number,
    score: number,
    interaction: InteractionType
  ): void {
    this.repository.add({
      query,
      memoryId,
      rank,
      score,
      interaction,
      timestamp: new Date().toISOString()
    });
  }
}