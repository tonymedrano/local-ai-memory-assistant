import { LearningRepository } from "../learning/learning.repository.js";

import { LearningService } from "../learning/learning.service.js";

export const learningRepository = new LearningRepository();

export const learningService = new LearningService(learningRepository);

import { MemoryRepository } from "../memory/memory.repository.js";


export const memoryRepository =
    new MemoryRepository();

export async function initLearning() {
  await learningRepository.init();

  console.log(`[Learning] Loaded ${learningRepository.getAll().length} events`);
}
