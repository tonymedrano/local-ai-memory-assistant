import assert from "node:assert/strict";

import { createConfig } from "../config.js";
import {
  MemoryRepository,
  type MemoryQdrantClient,
} from "../memory/memory.repository.js";
import { initMemoryCollection } from "./qdrant.service.js";

const DEFAULT_MEMORY_COLLECTION = "contextual_memory";
const CUSTOM_MEMORY_COLLECTION = "release_v1_memory";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function testBootstrapUsesConfiguredCollection(): Promise<void> {
  const configured = createConfig({
    MEMORY_COLLECTION: CUSTOM_MEMORY_COLLECTION,
  });
  const calls: string[] = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    calls.push(`${init?.method ?? "GET"} ${String(input)}`);

    if (init?.method === "PUT") {
      return response({ result: true });
    }

    return response({ result: { collections: [] } });
  };

  await initMemoryCollection({
    baseUrl: "http://qdrant.test",
    collection: configured.memoryCollection,
    fetch,
  });

  assert.deepEqual(calls, [
    "GET http://qdrant.test/collections",
    `PUT http://qdrant.test/collections/${CUSTOM_MEMORY_COLLECTION}`,
  ]);
}

async function testRepositoryUsesConfiguredCollection(): Promise<void> {
  const configured = createConfig({
    MEMORY_COLLECTION: CUSTOM_MEMORY_COLLECTION,
  });
  const calls: Array<{ operation: string; collection: string }> = [];

  const client = {
    async upsert(collection: string) {
      calls.push({ operation: "upsert", collection });
    },
    async search(collection: string) {
      calls.push({ operation: "search", collection });
      return [];
    },
    async setPayload(collection: string) {
      calls.push({ operation: "setPayload", collection });
    },
    async scroll(collection: string) {
      calls.push({ operation: "scroll", collection });
      return { points: [] };
    },
    async delete(collection: string) {
      calls.push({ operation: "delete", collection });
    },
  } as unknown as MemoryQdrantClient;

  const repository = new MemoryRepository(client, configured.memoryCollection);

  await repository.save("memory-1", [0.1], {
    id: "memory-1",
    text: "Configured collection test",
  });
  await repository.search([0.1]);

  assert.deepEqual(calls, [
    { operation: "upsert", collection: CUSTOM_MEMORY_COLLECTION },
    { operation: "search", collection: CUSTOM_MEMORY_COLLECTION },
  ]);
}

async function main(): Promise<void> {
  assert.equal(
    createConfig({}).memoryCollection,
    DEFAULT_MEMORY_COLLECTION,
    "the default memory collection must remain configured in config",
  );

  const configured = createConfig({
    MEMORY_COLLECTION: CUSTOM_MEMORY_COLLECTION,
  });
  assert.equal(configured.memoryCollection, CUSTOM_MEMORY_COLLECTION);

  assert.throws(
    () => createConfig({ MEMORY_COLLECTION: "   " }),
    /MEMORY_COLLECTION must be a non-empty collection name/,
  );

  await testBootstrapUsesConfiguredCollection();
  await testRepositoryUsesConfiguredCollection();

  await assert.rejects(
    initMemoryCollection({
      baseUrl: "http://unavailable-qdrant.test",
      fetch: async () => {
        throw new TypeError("connection refused");
      },
    }),
    /Unable to reach Qdrant at http:\/\/unavailable-qdrant\.test: connection refused/,
  );

  console.log("✓ Qdrant memory collection configuration tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
