import type { JobExecution } from "./job.types.js";

export class JobRepository {
  private executions: JobExecution[] = [];

  async start(name: string): Promise<JobExecution> {
    const execution: JobExecution = {
      id: crypto.randomUUID(),

      name,

      status: "running",

      startedAt: new Date().toISOString(),
    };

    this.executions.push(execution);

    return execution;
  }

  async complete(id: string): Promise<void> {
    const execution = this.executions.find((item) => item.id === id);

    if (!execution) {
      return;
    }

    execution.status = "completed";

    execution.finishedAt = new Date().toISOString();

    execution.duration =
      new Date(execution.finishedAt).getTime() -
      new Date(execution.startedAt).getTime();
  }

  async fail(id: string, error: unknown): Promise<void> {
    const execution = this.executions.find((item) => item.id === id);

    if (!execution) {
      return;
    }

    execution.status = "failed";

    execution.finishedAt = new Date().toISOString();

    execution.error = error instanceof Error ? error.message : String(error);
  }

  async getAll() {
    return this.executions;
  }
}
