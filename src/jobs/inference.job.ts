import { runJob } from "./job.runner.js";

import { runInference } from "../knowledge/inference/inference.engine.js";
import type { GraphScope } from "../knowledge/graph/graph.types.js";

export async function inferenceJob(scope: GraphScope) {
  if (!scope || scope.kind !== "tenant") throw new Error("Inference job requires an explicit tenant JobScope");
  await runJob(
    "inference", scope,

    async () => {
      const results = runInference(scope);

      console.log(
        `[InferenceJob] Generated ${results.length} derived knowledge`,
      );
    },
  );
}
