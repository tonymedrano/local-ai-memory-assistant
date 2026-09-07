import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { QdrantClient } from "@qdrant/js-client-rest";

import {
  MemoryRepository,
  type MemoryQdrantClient,
} from "../../memory/memory.repository.js";

const qdrantUrl = process.env.QDRANT_TEST_URL;

if (!qdrantUrl) {
  test(
    "MemoryRepository integration requires QDRANT_TEST_URL",
    { skip: "SKIPPED_PROVIDER_UNAVAILABLE: set QDRANT_TEST_URL to run against an isolated Qdrant instance" },
    () => {},
  );
} else {
  test("MemoryRepository stores and searches in an isolated collection", async () => {
    const collection = `memory_service_test_${randomUUID().replaceAll("-", "_")}`;
    const memoryId = randomUUID();
    const client = new QdrantClient({ url: qdrantUrl });
    const repository = new MemoryRepository(
      client as MemoryQdrantClient,
      collection,
    );

    await client.createCollection(collection, {
      vectors: {
        size: 2,
        distance: "Cosine",
      },
    });

    try {
      await repository.save(memoryId, [0.1, 0.2], {
        id: memoryId,
        text: "Integration memory",
        project: "test-project",
      });

      const results = await repository.search([0.1, 0.2], {
        project: "test-project",
      });

      assert.equal(results.length, 1);
      assert.equal(results[0]?.payload.id, memoryId);
    } finally {
      await client.deleteCollection(collection);
    }
  });
}
