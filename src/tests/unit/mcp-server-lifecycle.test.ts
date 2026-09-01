import assert from "node:assert/strict";
import test from "node:test";
import {
  createSearchMemoryHandler,
  startGlobalMemoryMcpServer,
  type GlobalMemoryMcpDependencies,
} from "../../mcp/server.js";

class FakeProtocol {
  transport: unknown | undefined;
  connectCalls = 0;
  closeCalls = 0;

  async connect(transport: unknown): Promise<void> {
    if (this.transport) {
      throw new Error(
        "Already connected to a transport. Call close() before connecting to a new transport.",
      );
    }

    this.transport = transport;
    this.connectCalls += 1;
  }

  async close(): Promise<void> {
    this.closeCalls += 1;
    this.transport = undefined;
  }
}

test("global-memory startup owns one Protocol/transport pair and closes it once", async () => {
  const protocols: FakeProtocol[] = [];
  const transports: object[] = [];
  let readyLogs = 0;

  const dependencies: GlobalMemoryMcpDependencies = {
    createServer: () => {
      const protocol = new FakeProtocol();
      protocols.push(protocol);
      return protocol;
    },
    createTransport: () => {
      const transport = {};
      transports.push(transport);
      return transport;
    },
    logReady: () => {
      readyLogs += 1;
    },
  };

  const first = await startGlobalMemoryMcpServer(dependencies);

  assert.equal(protocols.length, 1);
  assert.equal(transports.length, 1);
  assert.equal(protocols[0].connectCalls, 1);
  assert.equal(readyLogs, 1);

  const second = await startGlobalMemoryMcpServer(dependencies);

  assert.equal(protocols.length, 2);
  assert.equal(transports.length, 2);
  assert.notEqual(protocols[0], protocols[1]);
  assert.notEqual(transports[0], transports[1]);
  assert.equal(protocols[0].connectCalls, 1);
  assert.equal(protocols[1].connectCalls, 1);

  await Promise.all([first.close(), first.close()]);
  await second.close();

  assert.equal(protocols[0].closeCalls, 1);
  assert.equal(protocols[1].closeCalls, 1);
});

test("a Protocol rejects the former duplicate-connect sequence but can reconnect after close", async () => {
  const protocol = new FakeProtocol();

  await protocol.connect({});
  await assert.rejects(() => protocol.connect({}), /Already connected to a transport/);

  await protocol.close();
  await protocol.connect({});

  assert.equal(protocol.connectCalls, 2);
  assert.equal(protocol.closeCalls, 1);
});

test("global-memory does not call memory-service without its JWT", async () => {
  let fetchCalls = 0;
  const logs: unknown[][] = [];
  const handler = createSearchMemoryHandler({
    memoryServiceJwt: undefined,
    fetchImpl: async () => {
      fetchCalls += 1;
      return { ok: true, status: 200, text: async () => "{}" };
    },
    logError: (...args) => logs.push(args),
  });

  const result = await handler({ query: "safe query" });

  assert.equal(fetchCalls, 0);
  assert.equal(result.content[0].text, "Memory service authentication is not configured");
  assert.deepEqual(logs, [["[global-memory] MEMORY_SERVICE_JWT is missing"]]);
});

test("global-memory uses its configured URL and JWT without tenant headers", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const token = "tenant-scoped-test-token";
  const logs: unknown[][] = [];
  const handler = createSearchMemoryHandler({
    memoryServiceUrl: "http://memory.internal:4100",
    memoryServiceJwt: token,
    fetchImpl: async (url, init) => {
      requestedUrl = url;
      requestedInit = init;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ content: "tenant context" }),
      };
    },
    logError: (...args) => logs.push(args),
  });

  const result = await handler({ query: "project status" });
  const headers = requestedInit?.headers as Record<string, string>;

  assert.equal(requestedUrl, "http://memory.internal:4100/context");
  assert.equal(headers.Authorization, `Bearer ${token}`);
  assert.equal(headers["Content-Type"], "application/json");
  assert.equal(headers["X-Memory-User-Id"], undefined);
  assert.equal(result.content[0].text, "tenant context");
  assert.equal(JSON.stringify(logs).includes(token), false);
});

test("global-memory returns a useful MCP error for a non-JSON backend 401", async () => {
  const handler = createSearchMemoryHandler({
    memoryServiceJwt: "tenant-scoped-test-token",
    fetchImpl: async () => ({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    }),
    logError: () => {},
  });

  const result = await handler({ query: "project status" });

  assert.equal(result.content[0].text, "Memory service authentication failed");
});

test("global-memory distinguishes a backend 403 without parsing its non-JSON body", async () => {
  const handler = createSearchMemoryHandler({
    memoryServiceJwt: "tenant-scoped-test-token",
    fetchImpl: async () => ({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    }),
    logError: () => {},
  });

  const result = await handler({ query: "project status" });

  assert.equal(result.content[0].text, "Memory service authorization failed");
});

test("global-memory returns an MCP error when memory-service is unavailable", async () => {
  const handler = createSearchMemoryHandler({
    memoryServiceJwt: "tenant-scoped-test-token",
    fetchImpl: async () => {
      throw new Error("connection refused");
    },
    logError: () => {},
  });

  const result = await handler({ query: "project status" });

  assert.equal(result.content[0].text, "Memory service is unavailable");
});
