import { jobRepository } from "../jobs-history/job.repository.instance.js";

export async function runJob(name: string, task: () => Promise<void>) {
  const execution = await jobRepository.start(name);

  try {
    await task();

    await jobRepository.complete(execution.id!);
  } catch (error) {
    await jobRepository.fail(execution.id!, error);

    throw error;
  }
}
