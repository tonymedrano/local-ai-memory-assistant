import { LifecycleService } from "../lifecycle/lifecycle.service.js";

import { runJob } from "./job.runner.js";

const lifecycleService = new LifecycleService();

export async function lifecycleJob() {
  await runJob(
    "lifecycle",

    async () => {
      await lifecycleService.run();
    },
  );
}
