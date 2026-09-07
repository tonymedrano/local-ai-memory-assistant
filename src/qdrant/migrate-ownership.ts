import { qdrant } from "./qdrant.client.js";
import { config } from "../config.js";
import { readJsonFileSync } from "../persistence/json.file.js";

type Mapping = { version: 1; points: Record<string, { tenantId: string }> };
const validTenant = (value: string) => /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
export async function runOwnershipMigration(client: Pick<typeof qdrant, "scroll" | "setPayload">, mapping: Mapping, apply: boolean, pageSize = 100, collection = config.memoryCollection) {
let offset: string | number | null | undefined = undefined; let total = 0; let alreadyOwned = 0; let migratable = 0; let unresolved = 0; let invalid = 0; let conflicts = 0; let updated = 0;
const plan: Array<{ id: string | number; tenantId: string }> = [];
do {
  const page = await client.scroll(collection, { limit: pageSize, with_payload: true, ...(offset === undefined ? {} : { offset }) });
  total += page.points.length;
  for (const point of page.points) {
    const id = String(point.id); const payload = (point.payload ?? {}) as Record<string, unknown>; const existing = payload.tenantId;
    const target = mapping.points[id]?.tenantId;
    if (typeof existing === "string" && validTenant(existing)) { if (target && target !== existing) conflicts++; else alreadyOwned++; continue; }
    if (existing !== undefined && (typeof existing !== "string" || !validTenant(existing))) { invalid++; continue; }
    if (!target) { unresolved++; continue; }
    if (!validTenant(target)) { invalid++; continue; }
    migratable++;
    plan.push({ id: point.id, tenantId: target });
  }
  offset = page.next_page_offset as string | number | null | undefined;
} while (offset !== null && offset !== undefined);
// Preflight has completed across every page. Known source blockers cause a
// zero-write abort; applying only begins after this global decision.
if (apply && (unresolved || invalid || conflicts)) {
  throw Object.assign(new Error("Refusing Qdrant ownership apply with unresolved, invalid, or conflicting points"), { report: { collection, total, alreadyOwned, migratable, unresolved, invalid, conflicts, updated, failed: 0, dryRun: false } });
}
if (apply) {
  for (const entry of plan) {
    await client.setPayload(collection, { points: [entry.id], payload: { tenantId: entry.tenantId, ownershipSchemaVersion: 1 } });
    updated++;
  }
}
return { collection, total, alreadyOwned, migratable, unresolved, invalid, conflicts, updated, failed: 0, dryRun: !apply };
}

const mappingFlag = process.argv.indexOf("--mapping");
const mappingPath = mappingFlag === -1 ? undefined : process.argv[mappingFlag + 1];
if (mappingPath) {
  const report = await runOwnershipMigration(qdrant, readJsonFileSync<Mapping>(mappingPath, { version: 1, points: {} }), process.argv.includes("--apply"), Number(process.argv[process.argv.indexOf("--page-size") + 1] ?? 100));
  console.log(JSON.stringify(report, null, 2));
}
