import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { QdrantClient } from "@qdrant/js-client-rest";

import {
  MemoryRepository,
  type MemoryQdrantClient,
} from "../../memory/memory.repository.js";

const qdrantUrl = process.env.QDRANT_TEST_URL;
const vectorA = [1, 0];
const vectorA2 = [0, 1];

function memory(id: string, tenantId: string, text: string) {
  return {
    id,
    tenantId,
    text,
    project: "real-qdrant-tenant-isolation",
    metadata: { source: "integration", preserved: true },
    createdAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
  };
}

async function inspectPoint(
  client: QdrantClient,
  collection: string,
  id: string,
) {
  const points = await client.retrieve(collection, {
    ids: [id],
    with_payload: true,
    with_vector: true,
  });

  return points[0];
}

test("REAL QDRANT: MemoryRepository preserves tenant ownership and deletion semantics", async (t) => {
  if (!qdrantUrl) {
    t.skip("SKIPPED_PROVIDER_UNAVAILABLE: set QDRANT_TEST_URL to run against real Qdrant");
    return;
  }

  const client = new QdrantClient({ url: qdrantUrl });
  try {
    await client.getCollections();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    t.skip(`SKIPPED_PROVIDER_UNAVAILABLE: Qdrant connection failed: ${reason}`);
    return;
  }

  const collection = `memory-service-integration-${randomUUID().replaceAll("-", "_")}`;
  const repository = new MemoryRepository(client as MemoryQdrantClient, collection);
  const a1 = randomUUID();
  const a2 = randomUUID();
  const b1 = randomUUID();
  const legacy = randomUUID();

  await client.createCollection(collection, {
    vectors: { size: 2, distance: "Cosine" },
  });

  try {
    await repository.save(a1, vectorA, memory(a1, "tenant-a", "Apollo uses PostgreSQL alpha-private-memory"));
    await repository.save(a2, vectorA2, memory(a2, "tenant-a", "Apollo secondary alpha-secondary-memory"));
    // B1 deliberately shares A1's vector: filtering, not distance, enforces isolation.
    await repository.save(b1, vectorA, memory(b1, "tenant-b", "Apollo uses PostgreSQL beta-private-memory"));

    const storedA1 = await inspectPoint(client, collection, a1);
    assert.equal(storedA1?.payload?.tenantId, "tenant-a");
    assert.equal(storedA1?.payload?.text, "Apollo uses PostgreSQL alpha-private-memory");
    assert.deepEqual(storedA1?.payload?.metadata, { source: "integration", preserved: true });
    assert.equal(storedA1?.payload?.createdAt, "2026-08-31T00:00:00.000Z");
    assert.equal(storedA1?.payload?.updatedAt, "2026-08-31T00:00:00.000Z");

    assert.equal((await repository.findById(a1, "tenant-a"))?.text, "Apollo uses PostgreSQL alpha-private-memory");
    assert.equal(await repository.findById(a1, "tenant-b"), undefined);
    assert.equal(await repository.findById(b1, "tenant-a"), undefined);

    const aResults = await repository.search(vectorA, { tenantId: "tenant-a", limit: 10 });
    assert.ok(aResults.some((result) => result.id === a1));
    assert.ok(aResults.every((result) => result.payload.tenantId === "tenant-a"));
    assert.ok(aResults.every((result) => result.id !== b1));

    const bResults = await repository.search(vectorA, { tenantId: "tenant-b", limit: 10 });
    assert.ok(bResults.some((result) => result.id === b1));
    assert.ok(bResults.every((result) => result.payload.tenantId === "tenant-b"));
    assert.ok(bResults.every((result) => result.id !== a1 && result.id !== a2));

    await assert.rejects(() => repository.update(a1, { text: "foreign overwrite" }, "tenant-b"), /not found for tenant/);
    await assert.rejects(() => repository.delete(a1, "tenant-b"), /not found for tenant/);
    assert.equal((await repository.findById(a1, "tenant-a"))?.text, "Apollo uses PostgreSQL alpha-private-memory");

    const vectorBeforeUpdate = storedA1?.vector;
    await repository.update(a1, { text: "Apollo uses PostgreSQL alpha-updated-memory" }, "tenant-a");
    const updatedA1 = await inspectPoint(client, collection, a1);
    assert.equal(updatedA1?.id, a1);
    assert.equal(updatedA1?.payload?.tenantId, "tenant-a");
    assert.equal(updatedA1?.payload?.text, "Apollo uses PostgreSQL alpha-updated-memory");
    assert.deepEqual(updatedA1?.payload?.metadata, { source: "integration", preserved: true });
    assert.deepEqual(updatedA1?.vector, vectorBeforeUpdate);
    assert.equal((await repository.findById(a1, "tenant-a"))?.text, "Apollo uses PostgreSQL alpha-updated-memory");
    assert.equal(await repository.findById(a1, "tenant-b"), undefined);

    await client.upsert(collection, {
      wait: true,
      points: [{
        id: legacy,
        vector: vectorA,
        payload: { text: "legacy-unowned-memory", metadata: { source: "legacy" }, createdAt: "2026-08-31T00:00:00.000Z" },
      }],
    });
    for (const tenantId of ["tenant-a", "tenant-b"]) {
      const results = await repository.search(vectorA, { tenantId, limit: 10 });
      assert.ok(results.every((result) => result.id !== legacy));
    }

    await repository.delete(a1, "tenant-a");
    assert.equal(await inspectPoint(client, collection, a1), undefined);
    assert.equal(await repository.findById(a1, "tenant-a"), undefined);
    const afterDelete = await repository.search(vectorA, { tenantId: "tenant-a", limit: 10 });
    assert.ok(afterDelete.every((result) => result.id !== a1));
    assert.ok(afterDelete.every((result) => result.payload.text !== "Apollo uses PostgreSQL alpha-updated-memory"));
    assert.equal((await repository.findById(b1, "tenant-b"))?.text, "Apollo uses PostgreSQL beta-private-memory");
  } finally {
    await client.deleteCollection(collection);
    const remaining = await client.getCollections();
    assert.ok(
      remaining.collections.every((candidate) => candidate.name !== collection),
      `Integration collection ${collection} was not deleted`,
    );
  }
});
