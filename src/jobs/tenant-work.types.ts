import type { JobScope } from "../jobs-history/job.types.js";

export type TenantWorkType = "knowledge-extraction" | "inference" | "knowledge-maintenance" | "ltr-training";
export type WorkStatus = "pending" | "running" | "completed" | "failed";
export interface TenantWorkItem { id: string; scope: Extract<JobScope, { kind: "tenant" }>; type: TenantWorkType; status: WorkStatus; createdAt: string; updatedAt: string; attemptCount: number; payload?: Record<string, unknown>; error?: string; }
export interface TenantWorkFile { schemaVersion: 1; items: TenantWorkItem[]; }
