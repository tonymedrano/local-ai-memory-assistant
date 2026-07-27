import { JobRepository } from "../jobs-history/job.repository.js";

const repository = new JobRepository();

export async function runJob(name: string, task: () => Promise<void>) {
  const execution = await repository.start(name);

  try {
    await task();

    await repository.complete(execution.id!);
  } catch (error) {
    await repository.fail(execution.id!, error);

    throw error;
  }
}
