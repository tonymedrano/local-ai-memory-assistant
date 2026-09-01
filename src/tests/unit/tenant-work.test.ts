import assert from "node:assert/strict";
import { test } from "node:test";
import { TenantWorkRepository } from "../../jobs/tenant-work.repository.js";

test("tenant work persists and claims each tenant independently", () => {
  const repo = new TenantWorkRepository();
  const a = repo.enqueue({ kind: "tenant", tenantId: "tenant-a" }, "inference");
  const b = repo.enqueue({ kind: "tenant", tenantId: "tenant-b" }, "inference");
  const first = repo.claimNext()!;
  assert.equal(first.scope.tenantId, "tenant-a");
  repo.complete(first.id);
  const second = repo.claimNext()!;
  assert.equal(second.scope.tenantId, "tenant-b");
  repo.complete(second.id);
  assert.notEqual(a.id, b.id);
  const cleanup = new TenantWorkRepository();
  (cleanup as any).items = [];
  cleanup.clear();
});

test("tenant work rejects non-tenant and payload mismatch", () => {
  const repo = new TenantWorkRepository();
  assert.throws(() => repo.enqueue({ kind: "system" }, "inference"), /valid tenant scope/);
  assert.throws(() => repo.enqueue({ kind: "tenant", tenantId: "tenant-a" }, "inference", { tenantId: "tenant-b" }), /scope mismatch/);
});
