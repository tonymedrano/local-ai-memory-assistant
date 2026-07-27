import { runJob } from "./job.runner.js";

import { KnowledgeService } from "../knowledge/knowledge.service.js";
import { MemoryRepository } from "../memory/memory.repository.js";

const knowledgeService = new KnowledgeService();

const memoryRepository = new MemoryRepository();

export async function knowledgeExtractionJob() {
  await runJob(
    "knowledge-extraction",

    async () => {
      const memories = await memoryRepository.findPendingKnowledgeExtraction();

      console.log(
        `[KnowledgeExtractionJob] Processing ${memories.length} memories`,
      );

      for (const memory of memories) {
        const knowledge = await knowledgeService.processMemory(memory.text);

        await memoryRepository.markKnowledgeExtracted(memory.id);

        console.log(`[KnowledgeExtractionJob] extracted: ${knowledge.subject}`);
      }
    },
  );
}
