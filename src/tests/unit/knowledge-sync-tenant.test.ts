import assert from "node:assert/strict";
import { test } from "node:test";
import { KnowledgeSyncService } from "../../knowledge/sync/knowledge-sync.service.js";
import { GraphRepository, type GraphStorage } from "../../knowledge/graph/graph.repository.js";
import type { KnowledgeItem } from "../../knowledge/knowledge.types.js";
import type { KnowledgeGraph } from "../../knowledge/graph/graph.types.js";

class MemoryKnowledgeRepository {
  constructor(private readonly items: KnowledgeItem[]) {}
  async findAll(): Promise<KnowledgeItem[]> { return this.items; }
}

class MemoryGraphStorage implements GraphStorage {
  private graph: KnowledgeGraph = { nodes: [], edges: [] };
  load(): KnowledgeGraph { return structuredClone(this.graph); }
  save(graph: KnowledgeGraph): void { this.graph = structuredClone(graph); }
}

const item = (tenantId: string, subject: string): KnowledgeItem => ({
  id: `${tenantId}-${subject}`,
  tenantId,
  type: "technology",
  subject,
  content: subject,
  relations: [],
  confidence: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

test("knowledge sync isolates same labels by tenant", async () => {
  const repository = new GraphRepository(new MemoryGraphStorage());
  const service = new KnowledgeSyncService(
    new MemoryKnowledgeRepository([item("tenant-a", "Apollo"), item("tenant-b", "Apollo")]) as any,
    repository,
  );

  const report = await service.sync();
  assert.equal(report.valid, true);
  const a = repository.findByLabel({ kind: "tenant", tenantId: "tenant-a" }, "Apollo");
  const b = repository.findByLabel({ kind: "tenant", tenantId: "tenant-b" }, "Apollo");
  assert.ok(a);
  assert.ok(b);
  assert.notEqual(a.id, b.id);
  assert.equal(repository.getGraph({ kind: "system" }).nodes.length, 0);
});

test("knowledge sync refuses unowned knowledge", async () => {
  const service = new KnowledgeSyncService(
    new MemoryKnowledgeRepository([item("", "Apollo")]) as any,
    new GraphRepository(new MemoryGraphStorage()),
  );
  await assert.rejects(() => service.sync(), /no tenantId/);
});
