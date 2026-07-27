export type JobStatus = "running" | "completed" | "failed";

export interface JobExecution {
  id?: string;

  name: string;

  status: JobStatus;

  startedAt: string;

  finishedAt?: string;

  duration?: number;

  error?: string;
}
