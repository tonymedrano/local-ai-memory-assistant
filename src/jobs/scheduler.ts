import cron from "node-cron";

import { lifecycleJob } from "./lifecycle.job.js";
import { cleanupJob } from "./cleanup.job.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";
import { knowledgeConsolidationJob } from "./knowledge-consolidation.job.js";
import { relearningJob } from "./relearning.job.js";

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
   * Knowledge Extraction
   *
   * Cada día a las 04:00
   */
  cron.schedule("0 4 * * *", async () => {
    try {
      await knowledgeExtractionJob();
    } catch (error) {
      console.error("[Scheduler] Knowledge extraction failed", error);
    }
  });

  /**
   * Knowledge Consolidation
   *
   * Cada día a las 05:00
   */
  cron.schedule("0 5 * * *", async () => {
    try {
      await knowledgeConsolidationJob();
    } catch (error) {
      console.error("[Scheduler] Knowledge consolidation failed", error);
    }
  });

  /**
   * Knowledge Relearning
   *
   * Cada día a las 06:00
   */
  cron.schedule("0 6 * * *", async () => {
    try {
      await relearningJob();
    } catch (error) {
      console.error("[Scheduler] Relearning failed", error);
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

  console.log("[Scheduler] Running.");
}
