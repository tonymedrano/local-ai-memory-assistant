import assert from "node:assert/strict";
import test from "node:test";

import { ReadinessService } from "../../readiness/readiness.service.js";

test("is not ready until bootstrap has completed", async () => {
  let dependencyCalled = false;
  const readiness = new ReadinessService([
    {
      name: "qdrant",
      async check() {
        dependencyCalled = true;
      },
    },
  ]);

  const status = await readiness.getStatus(new Date("2026-01-01T00:00:00.000Z"));

  assert.equal(status.ready, false);
  assert.equal(status.checks.bootstrap.status, "error");
  assert.equal(dependencyCalled, false);
  assert.equal(status.timestamp, "2026-01-01T00:00:00.000Z");
});

test("is ready only when bootstrap and every required dependency succeed", async () => {
  const readiness = new ReadinessService([
    { name: "qdrant", async check() {} },
    { name: "ollama", async check() {} },
  ]);
  readiness.markReady();

  const status = await readiness.getStatus();

  assert.equal(status.ready, true);
  assert.deepEqual(status.checks, {
    bootstrap: { status: "ok" },
    qdrant: { status: "ok" },
    ollama: { status: "ok" },
  });
});

test("reports an unavailable dependency without marking the service ready", async () => {
  const readiness = new ReadinessService([
    { name: "qdrant", async check() {} },
    {
      name: "ollama",
      async check() {
        throw new Error("Ollama is unavailable at http://ollama.test: connection refused");
      },
    },
  ]);
  readiness.markReady();

  const status = await readiness.getStatus();

  assert.equal(status.ready, false);
  assert.deepEqual(status.checks.qdrant, { status: "ok" });
  assert.deepEqual(status.checks.ollama, {
    status: "error",
    error: "Ollama is unavailable at http://ollama.test: connection refused",
  });
});

test("surfaces a failed bootstrap without probing dependencies", async () => {
  let dependencyCalled = false;
  const readiness = new ReadinessService([
    {
      name: "qdrant",
      async check() {
        dependencyCalled = true;
      },
    },
  ]);
  readiness.markFailed(new Error("Unable to reach Qdrant"));

  const status = await readiness.getStatus();

  assert.equal(status.ready, false);
  assert.deepEqual(status.checks.bootstrap, {
    status: "error",
    error: "Unable to reach Qdrant",
  });
  assert.equal(dependencyCalled, false);
});
