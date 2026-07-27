import { LifecycleService } from "../lifecycle/lifecycle.service.js";

const lifecycleService = new LifecycleService();

export async function lifecycleJob(): Promise<void> {
  console.log("[JOB][Lifecycle] Starting...");

  try {
    await lifecycleService.run();

    console.log("[JOB][Lifecycle] Completed.");
  } catch (error) {
    console.error("[JOB][Lifecycle] Failed:", error);

    throw error;
  }
}

// ejecución manual
if (import.meta.url === `file://${process.argv[1]}`) {
  lifecycleJob().catch(() => process.exit(1));
}
