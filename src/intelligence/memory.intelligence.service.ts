import { memoryRepository as productionMemoryRepository, learningService } from "../core/container.js";

export class MemoryIntelligenceService {
  constructor(private readonly memoryRepository: Pick<typeof productionMemoryRepository, "findById"> = productionMemoryRepository) {}
  async inspect(tenantId: string, memoryId: string) {
    const memory = await this.memoryRepository.findById(memoryId, tenantId);

    if (!memory) {
      return null;
    }

    const events = learningService.getEvents(memoryId);
    const positiveSignals = events.filter(
      (e: { weight: number }) => e.weight > 0,
    ).length;
    const negativeSignals = events.filter(
      (e: { weight: number }) => e.weight < 0,
    ).length;

    return {
      memoryId,
      learning: {
        score: learningService.getLearningScore(memoryId),
        events: events.length,
        positiveSignals,
        negativeSignals,
      },

      memory: {
        importance: memory.importance ?? 0.5,
        confidence: memory.confidence ?? 0,
        archived: memory.archived ?? false,
      },
    };
  }
}
