import cron from "node-cron";

import { lifecycleJob } from "./lifecycle.job.js";
import { cleanupJob } from "./cleanup.job.js";

export function startScheduler(): void {
  console.log("[Scheduler] Starting...");

  /**
   * Lifecycle Manager
   *
   * Cada día a las 03:00
   */
  cron.schedule("0 3 * * *", async () => {
    await lifecycleJob();
  });

  /**
   * Cleanup
   *
   * Domingo 04:00
   */
  cron.schedule("0 4 * * 0", async () => {
    await cleanupJob();
  });

  console.log("[Scheduler] Running.");
}
