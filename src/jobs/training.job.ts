import type { TrainingService } from "../ltr/training/training.service.js";
import { runJob } from "./job.runner.js";

export interface TrainingJobDependencies {
  trainingService?: Pick<TrainingService, "train">;
}

export async function trainingJob(
  dependencies: TrainingJobDependencies = {},
): Promise<void> {
  const service =
    dependencies.trainingService ??
    (await import("../core/container.js")).trainingService;

  await runJob("training", async () => {
    console.log("[LTR] Training started");

    const start = Date.now();

    await service.train();

    console.log(
      "[LTR] Training finished in",
      Date.now() - start,
      "ms",
    );
  });
}
