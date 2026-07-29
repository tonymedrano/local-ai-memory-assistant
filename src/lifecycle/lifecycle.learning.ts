import { LearningService } from "../learning/learning.service.js";

import type { Memory } from "../memory/memory.types.js";

export class LifecycleLearning {
  constructor(private learningService: LearningService) {}

  apply(memory: Memory) {
    if (!memory.id) {
      return memory;
    }

    const learning = this.learningService.getLearningScore(memory.id);

    const importance = memory.importance ?? 0.5;

    if (learning > 0) {
      memory.importance = Math.min(1, importance + learning * 0.1);
    }

    if (learning < 0) {
      memory.importance = Math.max(0, importance + learning * 0.1);
    }

    return memory;
  }
}
