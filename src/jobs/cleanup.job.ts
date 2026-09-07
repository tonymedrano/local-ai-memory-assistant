import { runJob } from "./job.runner.js";
import { MemoryRepository } from "../memory/memory.repository.js";
import {
  CleanupService,
  type CleanupResult,
} from "../lifecycle/cleanup.service.js";

export interface CleanupJobDependencies {
  cleanupService?: Pick<CleanupService, "run">;
}

export async function cleanupJob(dependencies: CleanupJobDependencies = {}) {
  const cleanupService =
    dependencies.cleanupService ?? new CleanupService(new MemoryRepository());

  await runJob(
    "cleanup", { kind: "system" },

    async () => {
      const result: CleanupResult = await cleanupService.run();

      console.log(
        `[Cleanup] Scanned ${result.scanned}; ` +
          `eligible ${result.eligible}; deleted ${result.deleted}; ` +
          `active ${result.skippedActive}; recent ${result.skippedRecent}; ` +
          `invalid-date ${result.skippedInvalidDate}`,
      );
    },
  );
}
