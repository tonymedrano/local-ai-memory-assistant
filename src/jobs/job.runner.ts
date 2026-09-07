import { jobRepository } from "../jobs-history/job.repository.instance.js";
import type { JobScope } from "../jobs-history/job.types.js";

const runningJobs = new Set<string>();

export class JobAlreadyRunningError extends Error {
  constructor(name: string) {
    super(`Job "${name}" is already running`);
    this.name = "JobAlreadyRunningError";
  }
}

export async function runJob(name: string, scope: JobScope, task: () => Promise<void>) {
  if (runningJobs.has(name)) {
    throw new JobAlreadyRunningError(name);
  }

  runningJobs.add(name);

  const execution = await jobRepository.start(name, scope);

  try {
    await task();

    await jobRepository.complete(execution.id!);
  } catch (error) {
    await jobRepository.fail(execution.id!, error);

    throw error;
  } finally {
    runningJobs.delete(name);
  }
}
