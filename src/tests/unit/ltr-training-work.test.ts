import assert from "node:assert/strict";
import test from "node:test";
import { trainingJob } from "../../jobs/training.job.js";
import { feedbackScopeFromJobScope } from "../../ltr/training/training.job.js";

test("tenant training job forwards only its persisted scope", async () => {
  const scopes: unknown[] = [];
  await trainingJob({ kind: "tenant", tenantId: "tenant-a" }, { trainingService: { async train(scope: unknown) { scopes.push(scope); } } });
  assert.deepEqual(scopes, [{ kind: "tenant", tenantId: "tenant-a" }]);
});

test("system and legacy training scopes are rejected fail-closed", async () => {
  const service = { async train() { throw new Error("must not run"); } };
  await assert.rejects(() => trainingJob({ kind: "system" }, { trainingService: service }), /tenant job scope/);
  await assert.rejects(() => trainingJob({ kind: "legacy-unowned" }, { trainingService: service }), /tenant job scope/);
  assert.throws(() => feedbackScopeFromJobScope({ kind: "system" }), /tenant job scope/);
});
