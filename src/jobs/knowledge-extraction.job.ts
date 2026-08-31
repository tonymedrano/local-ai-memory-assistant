import { runJob } from "./job.runner.js";

import { KnowledgeService } from "../knowledge/knowledge.service.js";
import { MemoryRepository } from "../memory/memory.repository.js";
import type { KnowledgeSyncService } from "../knowledge/sync/knowledge-sync.service.js";

export interface KnowledgeExtractionJobDependencies {
  memoryRepository?: Pick<
    MemoryRepository,
    "findPendingKnowledgeExtraction" | "markKnowledgeExtracted"
  >;
  knowledgeService?: Pick<KnowledgeService, "processMemory">;
  knowledgeSyncService?: Pick<KnowledgeSyncService, "sync">;
}

export async function knowledgeExtractionJob(
  dependencies: KnowledgeExtractionJobDependencies = {},
) {
  const repository = dependencies.memoryRepository ?? new MemoryRepository();
  const service = dependencies.knowledgeService ?? new KnowledgeService();
  const syncService =
    dependencies.knowledgeSyncService ??
    new (await import("../knowledge/sync/knowledge-sync.service.js"))
      .KnowledgeSyncService();

  await runJob(
    "knowledge-extraction",

    async () => {
      const memories = await repository.findPendingKnowledgeExtraction();

      console.log(
        `[KnowledgeExtractionJob] Processing ${memories.length} memories`,
      );

      for (const memory of memories) {
        const knowledge = await service.processMemory(memory.text);

        await repository.markKnowledgeExtracted(memory.id);

        console.log(`[KnowledgeExtractionJob] extracted: ${knowledge.subject}`);
      }

      const report = await syncService.sync();

      if (!report.valid) {
        const details = report.errors.map((error) => error.message).join("; ");

        throw new Error(
          `[KnowledgeExtractionJob] Graph synchronization failed consistency validation: ${details}`,
        );
      }
    },
  );
}
