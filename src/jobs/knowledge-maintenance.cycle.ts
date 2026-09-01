import { inferenceJob } from "./inference.job.js";
import { knowledgeConsolidationJob } from "./knowledge-consolidation.job.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";
import { relearningJob } from "./relearning.job.js";
import type { JobScope } from "../jobs-history/job.types.js";

export interface KnowledgeMaintenanceCycleDependencies {
  knowledgeExtractionJob?: () => Promise<void>;
  knowledgeConsolidationJob?: () => Promise<void>;
  relearningJob?: () => Promise<void>;
  inferenceJob?: () => Promise<void>;
}

export async function knowledgeMaintenanceCycle(
  dependencies: KnowledgeMaintenanceCycleDependencies = {},
  scope?: JobScope,
): Promise<void> {
  if (!scope || scope.kind !== "tenant") throw new Error("Knowledge maintenance requires an explicit tenant JobScope");
  await (dependencies.knowledgeExtractionJob ?? (() => knowledgeExtractionJob({ scope })))();
  await (dependencies.knowledgeConsolidationJob ?? knowledgeConsolidationJob)();
  await (dependencies.relearningJob ?? relearningJob)();
  await (dependencies.inferenceJob ?? (() => inferenceJob(scope as any)))();
}
