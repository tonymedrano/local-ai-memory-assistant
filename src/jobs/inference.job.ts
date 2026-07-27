import { runJob } from "./job.runner.js";

import { runInference } from "../knowledge/inference/inference.engine.js";

export async function inferenceJob() {
  await runJob(
    "inference",

    async () => {
      const results = runInference();

      console.log(
        `[InferenceJob] Generated ${results.length} derived knowledge`,
      );
    },
  );
}
