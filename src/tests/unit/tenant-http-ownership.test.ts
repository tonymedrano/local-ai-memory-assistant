import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

process.env.AUTH_MODE = "jwt";
process.env.JWT_SECRET = "tenant-http-test-secret";

const { createApp } = await import("../../app.js");

function token(tenantId: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: `subject-${tenantId}`, tenantId, exp: Math.floor(Date.now() / 1000) + 3600 });
  const signature = createHmac("sha256", process.env.JWT_SECRET!).update(`${header}.${payload}`).digest("base64url");
  return `Bearer ${header}.${payload}.${signature}`;
}

const memories: Record<string, { id: string; tenantId?: string; importance: number; confidence: number; archived: boolean }> = {
  A1: { id: "A1", tenantId: "A", importance: 1, confidence: 1, archived: false },
  B1: { id: "B1", tenantId: "B", importance: 1, confidence: 1, archived: false },
  L1: { id: "L1", importance: 1, confidence: 1, archived: false },
};
const repository = {
  async findById(id: string, tenantId?: string) { const memory = memories[id]; return memory?.tenantId === tenantId ? memory : undefined; },
  async update() {},
};
const server = createApp({ memoryRepository: repository as any }).listen(0);
const base = `http://127.0.0.1:${(server.address() as any).port}`;
async function request(path: string, init: RequestInit = {}) { return fetch(base + path, init); }

test.after(() => server.close());

test("context feedback and intelligence enforce JWT tenant ownership", async () => {
  const headers = { authorization: token("A"), "content-type": "application/json" };
  assert.equal((await request("/context/feedback", { method: "POST", headers, body: JSON.stringify({ query: "q", memories: ["A1"], feedback: "positive" }) })).status, 200);
  assert.equal((await request("/context/feedback", { method: "POST", headers, body: JSON.stringify({ query: "q", memories: ["B1"], feedback: "positive" }) })).status, 500);
  assert.equal((await request("/context/feedback", { method: "POST", headers, body: JSON.stringify({ query: "q", memories: ["L1"], feedback: "positive" }) })).status, 500);
  assert.equal((await request("/context/feedback/A1", { headers: { authorization: token("B") } })).status, 404);
  assert.equal((await request("/memory/A1/intelligence", { headers: { authorization: token("B"), "x-memory-user-id": "A" } })).status, 404);
  assert.equal((await request("/context/feedback/A1")).status, 401);
  assert.equal((await request("/memory/A1/intelligence")).status, 401);
});
