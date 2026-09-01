import assert from "node:assert/strict";
import test from "node:test";
import {
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
