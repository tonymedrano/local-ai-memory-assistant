import { runJob } from "./job.runner.js";

export async function cleanupJob() {
  await runJob(
    "cleanup",

    async () => {
      console.log("[Cleanup] Nothing to do yet");
    },
  );
}
