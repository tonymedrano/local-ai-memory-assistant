import path from "node:path";
import { config } from "../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../persistence/json.file.js";
import type { JobScope } from "../jobs-history/job.types.js";
import type { TenantWorkFile, TenantWorkItem, TenantWorkType } from "./tenant-work.types.js";

export class TenantWorkRepository {
  private readonly file = path.join(config.dataDir, "tenant-work.json");
  private items: TenantWorkItem[];
  constructor() {
    const loaded = readJsonFileSync<TenantWorkFile>(this.file, { schemaVersion: 1, items: [] });
    if (loaded.schemaVersion !== 1 || !Array.isArray(loaded.items)) throw new Error("Invalid tenant work registry");
    this.items = loaded.items.filter((item) => {
      const valid = item.scope?.kind === "tenant" && Boolean(item.scope.tenantId) && ["pending", "running", "completed", "failed"].includes(item.status) && ["knowledge-extraction", "inference", "knowledge-maintenance", "ltr-training"].includes(item.type);
      if (!valid) console.warn(`[TenantWork] Skipping invalid work item ${item.id ?? "<unknown>"}`);
      return valid;
    });
    const now = new Date().toISOString();
    this.items = this.items.map((item) => item.status === "running" ? { ...item, status: "failed", error: "recovered_after_restart", updatedAt: now } : item);
  }
  enqueue(scope: JobScope, type: TenantWorkType, payload?: Record<string, unknown>): TenantWorkItem {
    if (scope.kind !== "tenant" || !scope.tenantId.trim()) throw new Error("Tenant work requires a valid tenant scope");
    if (payload && typeof payload.tenantId === "string" && payload.tenantId !== scope.tenantId) throw new Error("Tenant work payload scope mismatch");
    const now = new Date().toISOString();
    const item: TenantWorkItem = { id: crypto.randomUUID(), scope, type, status: "pending", createdAt: now, updatedAt: now, attemptCount: 0, payload };
    this.items.push(item); this.persist(); return item;
  }
  claimNext(): TenantWorkItem | undefined { const item = this.items.find((x) => x.status === "pending"); if (!item) return; item.status = "running"; item.attemptCount += 1; item.updatedAt = new Date().toISOString(); this.persist(); return structuredClone(item); }
  complete(id: string) { this.update(id, { status: "completed", error: undefined }); }
  fail(id: string, error: unknown) { this.update(id, { status: "failed", error: error instanceof Error ? error.message : String(error) }); }
  getAll() { return structuredClone(this.items); }
  clear() { this.items = []; this.persist(); }
  private update(id: string, changes: Partial<TenantWorkItem>) { const item = this.items.find((x) => x.id === id); if (!item) return; Object.assign(item, changes, { updatedAt: new Date().toISOString() }); this.persist(); }
  private persist() { writeJsonFileAtomicSync(this.file, { schemaVersion: 1, items: this.items }); }
}
export const tenantWorkRepository = new TenantWorkRepository();
