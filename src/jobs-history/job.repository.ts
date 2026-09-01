import path from "node:path";
import { config } from "../config.js";
import { readJsonFileSync, writeJsonFileAtomicSync } from "../persistence/json.file.js";
import type { JobExecution, JobScope } from "./job.types.js";

export class JobRepository {
  private executions: JobExecution[];
  private readonly file = path.join(config.dataDir, "job-history.json");

  constructor() {
    const loaded = readJsonFileSync<JobExecution[]>(this.file, []);
    this.executions = loaded.map((item) => item.scope ? item : { ...item, scope: { kind: "legacy-unowned" } });
  }

  async start(name: string, scope: JobScope): Promise<JobExecution> {
    if (!scope || scope.kind === "legacy-unowned") throw new Error("Executable jobs require tenant or system scope");
    const execution: JobExecution = { id: crypto.randomUUID(), name, scope, status: "running", startedAt: new Date().toISOString() };
    this.executions.push(execution); this.persist(); return execution;
  }
  async complete(id: string): Promise<void> { const e = this.executions.find((x) => x.id === id); if (!e) return; e.status = "completed"; e.finishedAt = new Date().toISOString(); e.duration = Date.parse(e.finishedAt) - Date.parse(e.startedAt); this.persist(); }
  async fail(id: string, error: unknown): Promise<void> { const e = this.executions.find((x) => x.id === id); if (!e) return; e.status = "failed"; e.finishedAt = new Date().toISOString(); e.duration = Date.parse(e.finishedAt) - Date.parse(e.startedAt); e.error = error instanceof Error ? error.message : String(error); this.persist(); }
  async getLatest(name?: string) { const items = name ? this.executions.filter((e) => e.name === name) : this.executions; return items.at(-1); }
  async getAll() { return this.executions; }
  async clear() { this.executions = []; this.persist(); }
  private persist() { writeJsonFileAtomicSync(this.file, this.executions); }
}
