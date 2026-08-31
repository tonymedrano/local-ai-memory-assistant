import assert from "node:assert/strict";
import test from "node:test";

import {
  ARCHIVED_MEMORY_RETENTION_DAYS,
  CleanupService,
} from "../../lifecycle/cleanup.service.js";
import type { Memory } from "../../memory/memory.types.js";
import { cleanupJob } from "../../jobs/cleanup.job.js";

const now = new Date("2026-08-31T00:00:00.000Z");
const oldDate = new Date(
  now.getTime() - (ARCHIVED_MEMORY_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000,
).toISOString();
const recentDate = new Date(
  now.getTime() - 7 * 24 * 60 * 60 * 1000,
).toISOString();
const futureDate = new Date(
  now.getTime() + 7 * 24 * 60 * 60 * 1000,
).toISOString();

function memory(id: string, overrides: Partial<Memory>): Memory {
  return {
    id,
    text: `memory ${id}`,
    ...overrides,
  };
}

test("deletes only archived memories past the retention window", async () => {
  const items = [
    memory("active", { archived: false, updatedAt: oldDate }),
    memory("recent", { archived: true, updatedAt: recentDate }),
    memory("invalid", { archived: true, updatedAt: "not-a-date" }),
    memory("missing-date", { archived: true }),
    memory("future", { archived: true, updatedAt: futureDate }),
    memory("expired", { archived: true, updatedAt: oldDate }),
  ];
  const deleted: string[] = [];
  const repository = {
    async getAll() {
      return items;
    },
    async delete(id: string) {
      deleted.push(id);
    },
  };
  const service = new CleanupService(repository, ARCHIVED_MEMORY_RETENTION_DAYS, () => now);

  const result = await service.run();

  assert.deepEqual(deleted, ["expired"]);
  assert.deepEqual(result, {
    scanned: 6,
    eligible: 1,
    deleted: 1,
    skippedActive: 1,
    skippedRecent: 1,
    skippedInvalidDate: 3,
  });
});

test("is idempotent after eligible memories have been removed", async () => {
  const items = [memory("expired", { archived: true, updatedAt: oldDate })];
  const repository = {
    async getAll() {
      return [...items];
    },
    async delete(id: string) {
      const index = items.findIndex((item) => item.id === id);

      if (index >= 0) {
        items.splice(index, 1);
      }
    },
  };
  const service = new CleanupService(repository, ARCHIVED_MEMORY_RETENTION_DAYS, () => now);

  assert.equal((await service.run()).deleted, 1);
  assert.equal((await service.run()).deleted, 0);
});

test("runs cleanup through the shared job wrapper", async () => {
  let calls = 0;

  await cleanupJob({
    cleanupService: {
      async run() {
        calls++;
        return {
          scanned: 1,
          eligible: 0,
          deleted: 0,
          skippedActive: 1,
          skippedRecent: 0,
          skippedInvalidDate: 0,
        };
      },
    },
  });

  assert.equal(calls, 1);
});
