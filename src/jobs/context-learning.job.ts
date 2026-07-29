import { runJob } from "./job.runner.js";

import { MemoryRepository } from "../memory/memory.repository.js";

import { LearningRepository } from "../learning/learning.repository.js";

import { LearningService } from "../learning/learning.service.js";

const memoryRepository = new MemoryRepository();

const learningRepository = new LearningRepository();

const learningService = new LearningService(learningRepository);

export async function contextLearningJob() {
  await runJob(
    "context-learning",

    async () => {
      const memories = await memoryRepository.getAll();

      console.log(`[ContextLearningJob] Reviewing ${memories.length} memories`);

      for (const memory of memories) {
        if (!memory.id) {
          continue;
        }

        const memoryId = String(memory.id);

        const score = learningService.getLearningScore(memoryId);

        console.log(`[ContextLearningJob] ${memoryId}: ${score}`);
      }
    },
  );
}
