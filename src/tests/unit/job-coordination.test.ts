import assert from "node:assert/strict";
import test from "node:test";

import { jobRepository } from "../../jobs-history/job.repository.instance.js";
import {
  JobAlreadyRunningError,
  runJob,
} from "../../jobs/job.runner.js";
import { knowledgeMaintenanceCycle } from "../../jobs/knowledge-maintenance.cycle.js";

test.beforeEach(async () => {
  await jobRepository.clear();
});

test("prevents concurrent executions of the same job", async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });

  const first = runJob("exclusive-job", async () => pending);

  await assert.rejects(
    runJob("exclusive-job", async () => {}),
    JobAlreadyRunningError,
  );

  release();
  await first;

  const latest = await jobRepository.getLatest("exclusive-job");

  assert.equal(latest?.status, "completed");
  assert.equal((await jobRepository.getAll()).length, 1);
});

test("runs dependent knowledge jobs in order", async () => {
  const calls: string[] = [];

  await knowledgeMaintenanceCycle({
    async knowledgeExtractionJob() {
      calls.push("extraction");
    },
    async knowledgeConsolidationJob() {
      calls.push("consolidation");
    },
    async relearningJob() {
      calls.push("relearning");
    },
    async inferenceJob() {
      calls.push("inference");
    },
  });

  assert.deepEqual(calls, [
    "extraction",
    "consolidation",
    "relearning",
    "inference",
  ]);
});

test("stops the dependent cycle when an earlier stage fails", async () => {
  const calls: string[] = [];

  await assert.rejects(
    knowledgeMaintenanceCycle({
      async knowledgeExtractionJob() {
        calls.push("extraction");
        throw new Error("extraction unavailable");
      },
      async knowledgeConsolidationJob() {
        calls.push("consolidation");
      },
      async relearningJob() {
        calls.push("relearning");
      },
      async inferenceJob() {
        calls.push("inference");
      },
    }),
    /extraction unavailable/,
  );

  assert.deepEqual(calls, ["extraction"]);
});
