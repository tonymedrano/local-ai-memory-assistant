export type JobStatus = "running" | "completed" | "failed";
export type JobScope = { kind: "tenant"; tenantId: string } | { kind: "system" } | { kind: "legacy-unowned" };
export const systemJobScope: JobScope = { kind: "system" };

export interface JobExecution {
  id?: string;

  name: string;

  scope: JobScope;

  status: JobStatus;

  startedAt: string;

  finishedAt?: string;

  duration?: number;

  error?: string;
}
