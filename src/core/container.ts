import { LearningRepository } from "../learning/learning.repository.js";
import { LearningService } from "../learning/learning.service.js";

import { MemoryRepository } from "../memory/memory.repository.js";

import { KeywordIndex } from "../retrieval/index/keyword.index.js";
import { KeywordIndexLoader } from "../retrieval/index/keyword.index.loader.js";

export const learningRepository = new LearningRepository();
export const learningService = new LearningService(learningRepository);
export const memoryRepository = new MemoryRepository();
export const keywordIndex = new KeywordIndex();
export const keywordIndexLoader = new KeywordIndexLoader(
  memoryRepository,
  keywordIndex,
);

export async function initLearning() {
  await learningRepository.init();

  console.log(`[Learning] Loaded ${learningRepository.getAll().length} events`);
}
