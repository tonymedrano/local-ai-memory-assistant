import type { ContextLearning } from "./learning.types.js";

export class LearningRepository {
  private events: ContextLearning[] = [];

  save(learning: ContextLearning) {
    this.events.push(learning);
  }

  findByMemory(memoryId: string) {
    return this.events.filter((x) => x.memoryId === memoryId);
  }

  getAll() {
    return this.events;
  }
}
