import cron from "node-cron";

import { lifecycleJob } from "./lifecycle.job.js";
import { cleanupJob } from "./cleanup.job.js";
import { knowledgeMaintenanceCycle } from "./knowledge-maintenance.cycle.js";
import { contextLearningJob } from "./context-learning.job.js";
import { trainingJob } from "./training.job.js";

export function startScheduler(): void {
  console.log("[Scheduler] Starting...");

  /**
   * Lifecycle Manager
   *
   * Cada día a las 03:00
   */
  cron.schedule("0 3 * * *", async () => {
    try {
      await lifecycleJob();
    } catch (error) {
      console.error("[Scheduler] Lifecycle failed", error);
    }
  });

  /**
   * Knowledge maintenance cycle
   *
   * Every dependent stage is awaited in this order:
   * extraction -> consolidation -> relearning -> inference.
   */
  cron.schedule("0 4 * * *", async () => {
    try {
      await knowledgeMaintenanceCycle();
    } catch (error) {
      console.error("[Scheduler] Knowledge maintenance cycle failed", error);
    }
  });

  cron.schedule("30 5 * * *", async () => {
    try {
      await contextLearningJob();
    } catch (error) {
      console.error("[Scheduler] context learning job failed", error);
    }
  });

  /**
   * Cleanup
   *
   * Domingo 04:00
   */
  cron.schedule("0 4 * * 0", async () => {
    await cleanupJob();
  });

  /**
   * LTR Training
   *
   * Cada día a las 05:45
   */
  cron.schedule("45 5 * * *", async () => {
    try {
      await trainingJob();
    } catch (error) {
      console.error("[Scheduler] LTR training failed", error);
    }
  });

  console.log("[Scheduler] Running.");
}
