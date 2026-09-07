import assert from "node:assert/strict";
import { test } from "node:test";
import { KnowledgeExtractor } from "../../knowledge/extractor.service.js";

const response = JSON.stringify({
  type: "fact",
  subject: "Apollo",
  content: "owned",
  relations: [],
  confidence: 0.9,
});

test("knowledge extractor propagates memory tenant", async () => {
  const extractor = new KnowledgeExtractor({ complete: async () => response } as any);
  const knowledge = await extractor.extract({ text: "Apollo", tenantId: "tenant-a" });
  assert.equal(knowledge.tenantId, "tenant-a");
});

test("knowledge extractor rejects memory without tenant", async () => {
  const extractor = new KnowledgeExtractor({ complete: async () => response } as any);
  await assert.rejects(() => extractor.extract({ text: "Apollo" }), /without tenantId/);
});
