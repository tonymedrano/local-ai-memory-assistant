import assert from "node:assert/strict";
import test from "node:test";

import { runNextTenantWork } from "../../jobs/scheduler.js";
import type { TenantWorkItem } from "../../jobs/tenant-work.types.js";

function work(type: TenantWorkItem["type"]): TenantWorkItem {
  return {
    id: `work-${type}`,
    type,
    scope: { kind: "tenant", tenantId: "tenant-a" },
    status: "pending",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    attemptCount: 0,
  };
}

function dependencies(item: TenantWorkItem) {
  const completed: string[] = [];
  const failed: Array<{ id: string; error: unknown }> = [];
  const calls: string[] = [];

  return {
    completed,
    failed,
    calls,
    dependencies: {
      tenantWorkRepository: {
        claimNext: () => item,
        complete: (id: string) => completed.push(id),
        fail: (id: string, error: unknown) => failed.push({ id, error }),
      },
      knowledgeExtractionJob: async ({ scope }: { scope?: unknown } = {}) => {
        calls.push(`extract:${JSON.stringify(scope)}`);
      },
      inferenceJob: async (scope: unknown) => {
        calls.push(`inference:${JSON.stringify(scope)}`);
      },
      trainingJob: async (scope: unknown) => {
        calls.push(`ltr:${JSON.stringify(scope)}`);
      },
    },
  };
}

test("tenant work dispatcher executes only supported work types with their persisted tenant scope", async () => {
  for (const [type, expected] of [
    ["knowledge-extraction", 'extract:{"kind":"tenant","tenantId":"tenant-a"}'],
    ["inference", 'inference:{"kind":"tenant","tenantId":"tenant-a"}'],
    ["ltr-training", 'ltr:{"kind":"tenant","tenantId":"tenant-a"}'],
  ] as const) {
    const fixture = dependencies(work(type));

    assert.equal(await runNextTenantWork(fixture.dependencies), true);
    assert.deepEqual(fixture.calls, [expected]);
    assert.deepEqual(fixture.completed, [`work-${type}`]);
    assert.deepEqual(fixture.failed, []);
  }
});

test("tenant work dispatcher fails closed for disabled and unknown work", async () => {
  const disabled = dependencies(work("knowledge-maintenance"));
  await assert.rejects(
    runNextTenantWork(disabled.dependencies),
    /Knowledge maintenance is disabled pending tenant-scoped consolidation and relearning/,
  );
  assert.deepEqual(disabled.calls, []);
  assert.deepEqual(disabled.completed, []);
  assert.equal(disabled.failed.length, 1);

  const unknown = dependencies({ ...work("inference"), id: "work-unknown", type: "unknown" as TenantWorkItem["type"] });
  await assert.rejects(runNextTenantWork(unknown.dependencies), /Unsupported tenant work type: unknown/);
  assert.deepEqual(unknown.calls, []);
  assert.deepEqual(unknown.completed, []);
  assert.equal(unknown.failed.length, 1);
});
