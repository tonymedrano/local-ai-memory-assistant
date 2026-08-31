import assert from "node:assert/strict";
import { once } from "node:events";
import test, { after, before } from "node:test";

import { app } from "../../app.js";

let baseUrl = "";
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0);
  await once(server, "listening");

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.close();
  await once(server, "close");
});

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

test("rejects invalid memory, search, context, and feedback payloads", async () => {
  const cases = [
    ["/memory", {}],
    ["/memory/search", { query: "" }],
    ["/context", { query: 42 }],
    ["/context/feedback", { query: "test", memories: [], feedback: "positive" }],
  ] as const;

  for (const [path, body] of cases) {
    const response = await request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    assert.equal(response.status, 400, path);

    const payload = await response.json();
    assert.equal(payload.code, "VALIDATION_ERROR", path);
    assert.equal(typeof payload.error, "string", path);
  }
});

test("returns a validation error for malformed JSON", async () => {
  const response = await request("/memory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Malformed JSON request body",
    code: "VALIDATION_ERROR",
  });
});

test("rejects request bodies above the JSON size limit", async () => {
  const response = await request("/memory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "x".repeat(1_050_000) }),
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: "Request body exceeds 1mb limit",
    code: "PAYLOAD_TOO_LARGE",
  });
});

test("validates path parameters and exposes a consistent 404 contract", async () => {
  const invalidId = await request("/knowledge/graph/node/%20%20");
  assert.equal(invalidId.status, 400);
  assert.equal((await invalidId.json()).code, "VALIDATION_ERROR");

  const missingRoute = await request("/route-that-does-not-exist");
  assert.equal(missingRoute.status, 404);
  assert.deepEqual(await missingRoute.json(), {
    error: "Route not found",
    code: "NOT_FOUND",
  });
});

test("returns the full inference collection when no subject is requested", async () => {
  const response = await request("/knowledge/inference/");

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(await response.json()), true);
});

test("reports startup readiness separately from liveness", async () => {
  const health = await request("/health");
  assert.equal(health.status, 200);

  const ready = await request("/ready");
  assert.equal(ready.status, 503);

  const payload = await ready.json();
  assert.equal(payload.ready, false);
  assert.equal(payload.checks.bootstrap.status, "error");
});
