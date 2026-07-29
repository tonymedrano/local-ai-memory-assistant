import type { ContextLearning } from "./learning.types.js";
import { LearningStorage } from "./learning.storage.js";

export class LearningRepository {
  private events: ContextLearning[] = [];

  constructor(private storage = new LearningStorage()) {}

  async init() {
    this.events = await this.storage.load();
  }

  async save(learning: ContextLearning) {
    this.events.push(learning);

    await this.storage.save(this.events);
  }

  findByMemory(memoryId: string) {
    return this.events.filter((x) => x.memoryId === memoryId);
  }

  getAll() {
    return this.events;
  }
}
