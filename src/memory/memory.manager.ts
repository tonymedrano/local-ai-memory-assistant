import { recall, store, consolidationService } from "../core/container.js";

import { MemoryType } from "./memory.types.js";

export class MemoryManager {
  async rememberFact(text: string, project?: string) {
    return store({
      text,
      type: MemoryType.FACT,
      project,
    });
  }

  async rememberDecision(text: string, project: string) {
    return store({
      text,
      type: MemoryType.DECISION,
      project,
    });
  }

  async rememberCode(text: string, project: string) {
    return store({
      text,
      type: MemoryType.CODE,
      project,
    });
  }

  async search(query: string) {
    return recall(query);
  }

  async consolidate(memoryId: string) {
    return consolidationService.consolidateById(memoryId);
  }
}
