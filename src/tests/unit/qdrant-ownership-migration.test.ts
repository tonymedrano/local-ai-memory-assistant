import assert from "node:assert/strict";
import test from "node:test";
import { runOwnershipMigration } from "../../qdrant/migrate-ownership.js";

function fake(pages: any[][]) { const writes: any[] = []; const all = pages.flat(); return { writes, pages, client: { async scroll(_c: string, req: any) { const page = req.offset === undefined ? 0 : Number(req.offset); return { points: pages[page] ?? [], next_page_offset: page + 1 < pages.length ? page + 1 : null }; }, async setPayload(_c: string, request: any) { writes.push(request); for (const id of request.points) Object.assign(all.find((point) => point.id === id).payload, request.payload); } } }; }
const point = (id: string, tenantId?: unknown) => ({ id, vector: [7, 8], payload: { text: id, metadata: { source: "test" }, createdAt: "before", updatedAt: "before", knowledgeExtracted: false, ...(tenantId === undefined ? {} : { tenantId }), customField: true } });

test("late unresolved blocks apply after complete pagination with zero writes", async () => {
  const f = fake([[point("P1"), point("P2")], [point("P3")], [point("P4")]]);
  await assert.rejects(() => runOwnershipMigration(f.client as any, { version: 1, points: { P1: { tenantId: "tenant-a" }, P2: { tenantId: "tenant-a" }, P3: { tenantId: "tenant-b" } } }, true), /Refusing/);
  assert.equal(f.writes.length, 0);
});

test("clean apply preserves payload and is idempotent", async () => {
  const f = fake([[point("P1"), point("P2", "tenant-a")], [point("P3")]]);
  const mapping = { version: 1 as const, points: { P1: { tenantId: "tenant-a" }, P2: { tenantId: "tenant-a" }, P3: { tenantId: "tenant-b" } } };
  const report = await runOwnershipMigration(f.client as any, mapping, true);
  assert.equal(report.updated, 2); assert.equal(f.writes.length, 2);
  assert.deepEqual(f.writes[0].payload, { tenantId: "tenant-a", ownershipSchemaVersion: 1 });
  assert.deepEqual(f.pages[0][0].vector, [7, 8]); assert.equal(f.pages[0][0].payload.customField, true); assert.deepEqual(f.pages[0][0].payload.metadata, { source: "test" });
  const second = await runOwnershipMigration(f.client as any, mapping, true);
  assert.equal(second.migratable, 0); assert.equal(second.updated, 0); assert.equal(f.writes.length, 2);
});

test("late conflict and invalid both abort with zero writes", async () => {
  const conflict = fake([[point("P1")], [point("P2")], [point("P3", "tenant-a")]]);
  await assert.rejects(() => runOwnershipMigration(conflict.client as any, { version: 1, points: { P1: { tenantId: "tenant-a" }, P2: { tenantId: "tenant-b" }, P3: { tenantId: "tenant-b" } } }, true), /Refusing/);
  assert.equal(conflict.writes.length, 0);
  const invalid = fake([[point("P1")], [point("P2")], [point("P3", "bad tenant")] ]);
  await assert.rejects(() => runOwnershipMigration(invalid.client as any, { version: 1, points: { P1: { tenantId: "tenant-a" }, P2: { tenantId: "tenant-b" }, P3: { tenantId: "tenant-a" } } }, true), /Refusing/);
  assert.equal(invalid.writes.length, 0);
});
