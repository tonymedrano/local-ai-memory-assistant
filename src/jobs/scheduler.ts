import cron from "node-cron";

import { trainingJob } from "./training.job.js";
import { tenantWorkRepository } from "./tenant-work.repository.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";
import { inferenceJob } from "./inference.job.js";

export interface TenantWorkSchedulerDependencies {
  tenantWorkRepository?: Pick<typeof tenantWorkRepository, "claimNext" | "complete" | "fail">;
  knowledgeExtractionJob?: typeof knowledgeExtractionJob;
  inferenceJob?: typeof inferenceJob;
  trainingJob?: typeof trainingJob;
}

export async function runNextTenantWork(
  dependencies: TenantWorkSchedulerDependencies = {},
): Promise<boolean> {
  const workRepository = dependencies.tenantWorkRepository ?? tenantWorkRepository;
  const extractKnowledge = dependencies.knowledgeExtractionJob ?? knowledgeExtractionJob;
  const inferKnowledge = dependencies.inferenceJob ?? inferenceJob;
  const trainLtr = dependencies.trainingJob ?? trainingJob;
  const work = workRepository.claimNext();
  if (!work) return false;
  try {
    if (work.type === "knowledge-extraction") await extractKnowledge({ scope: work.scope });
    else if (work.type === "inference") await inferKnowledge({ kind: "tenant", tenantId: work.scope.tenantId });
    else if (work.type === "knowledge-maintenance") throw new Error("Knowledge maintenance is disabled pending tenant-scoped consolidation and relearning");
    else if (work.type === "ltr-training") await trainLtr(work.scope);
    else throw new Error(`Unsupported tenant work type: ${String(work.type)}`);
    workRepository.complete(work.id);
  } catch (error) {
    workRepository.fail(work.id, error);
    throw error;
  }
  return true;
}

export function startScheduler(): void {
  console.log("[Scheduler] Starting...");

  // Drain durable tenant-owned work; each item carries its own persisted scope.
  cron.schedule("0 4 * * *", async () => {
    try {
      while (await runNextTenantWork()) {
        // Drain durable tenant work items one scope at a time.
      }
    } catch (error) {
      console.error("[Scheduler] Tenant work drain failed", error);
    }
  });

  console.log("[Scheduler] Running.");
}
