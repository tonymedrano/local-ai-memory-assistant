import { runJob } from "./job.runner.js";
import { memoryRepository } from "../core/container.js";
import { learningService } from "../core/container.js";

export async function contextLearningJob() {
  await runJob(
    "context-learning", { kind: "system" },

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
