import { inferenceJob } from "./inference.job.js";
import { knowledgeConsolidationJob } from "./knowledge-consolidation.job.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";
import { relearningJob } from "./relearning.job.js";

export interface KnowledgeMaintenanceCycleDependencies {
  knowledgeExtractionJob?: () => Promise<void>;
  knowledgeConsolidationJob?: () => Promise<void>;
  relearningJob?: () => Promise<void>;
  inferenceJob?: () => Promise<void>;
}

export async function knowledgeMaintenanceCycle(
  dependencies: KnowledgeMaintenanceCycleDependencies = {},
): Promise<void> {
  await (dependencies.knowledgeExtractionJob ?? knowledgeExtractionJob)();
  await (dependencies.knowledgeConsolidationJob ?? knowledgeConsolidationJob)();
  await (dependencies.relearningJob ?? relearningJob)();
  await (dependencies.inferenceJob ?? inferenceJob)();
}
