import type { TrainingService } from "../ltr/training/training.service.js";
import type { JobScope } from "../jobs-history/job.types.js";
import { TrainingJob } from "../ltr/training/training.job.js";
import { runJob } from "./job.runner.js";

export interface TrainingJobDependencies {
  trainingService?: Pick<TrainingService, "train">;
}

export async function trainingJob(
  scope: JobScope,
  dependencies: TrainingJobDependencies = {},
): Promise<void> {
  if (scope.kind !== "tenant") throw new Error("LTR training requires tenant job scope");
  const service =
    dependencies.trainingService ??
    (await import("../core/container.js")).trainingService;

  await runJob("training", scope, () => new TrainingJob(service as TrainingService).run(scope));
}
