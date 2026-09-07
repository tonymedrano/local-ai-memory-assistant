import assert from "node:assert/strict";
import { test } from "node:test";
import { JobRepository } from "../../jobs-history/job.repository.js";

test("tenant job scope survives repository reload", async () => {
  const first = new JobRepository();
  await first.clear();
  const created = await first.start("inference", { kind: "tenant", tenantId: "tenant-a" });
  const second = new JobRepository();
  const loaded = await second.getLatest("inference");
  assert.equal(loaded?.id, created.id);
  assert.deepEqual(loaded?.scope, { kind: "tenant", tenantId: "tenant-a" });
  await second.clear();
});

test("legacy unowned records cannot be executed", async () => {
  const repository = new JobRepository();
  await assert.rejects(() => repository.start("inference", { kind: "legacy-unowned" }), /require tenant or system scope/);
  await repository.clear();
});
