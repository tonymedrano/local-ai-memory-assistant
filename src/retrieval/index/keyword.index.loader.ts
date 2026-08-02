import { MemoryRepository } from "../../memory/memory.repository.js";
import { KeywordIndex } from "./keyword.index.js";

export class KeywordIndexLoader {
  constructor(
    private repository: MemoryRepository,
    private index: KeywordIndex,
  ) {}

  async load() {
    const memories = await this.repository.getAll();

    for (const memory of memories) {
      this.index.add(memory);
    }

    console.log(`[KeywordIndex] Loaded ${memories.length} memories`);
  }
}
