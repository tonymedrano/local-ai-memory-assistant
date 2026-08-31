import assert from "node:assert/strict";
import test from "node:test";

import { jobRepository } from "../../jobs-history/job.repository.instance.js";
import { trainingJob } from "../../jobs/training.job.js";

test.beforeEach(async () => {
  await jobRepository.clear();
});

test("records a completed training job", async () => {
  let calls = 0;

  await trainingJob({
    trainingService: {
      async train() {
        calls++;
      },
    },
  });

  const execution = await jobRepository.getLatest("training");

  assert.equal(calls, 1);
  assert.deepEqual(execution?.name, "training");
  assert.equal(execution?.status, "completed");
  assert.equal(typeof execution?.duration, "number");
  assert.equal(execution?.error, undefined);
});

test("records a completed job when training has insufficient samples", async () => {
  await trainingJob({
    trainingService: {
      async train() {
        // TrainingService treats insufficient feedback as a successful no-op.
      },
    },
  });

  const execution = await jobRepository.getLatest("training");

  assert.equal(execution?.status, "completed");
  assert.equal(typeof execution?.duration, "number");
});

test("records a failed training job and preserves the failure", async () => {
  await assert.rejects(
    trainingJob({
      trainingService: {
        async train() {
          throw new Error("model storage unavailable");
        },
      },
    }),
    /model storage unavailable/,
  );

  const execution = await jobRepository.getLatest("training");

  assert.equal(execution?.status, "failed");
  assert.equal(execution?.error, "model storage unavailable");
  assert.equal(typeof execution?.duration, "number");
});
