import assert from "node:assert/strict";
import test from "node:test";
import { GraphRepository, type GraphStorage } from "../../knowledge/graph/graph.repository.js";
import { tenantGraphScope, systemGraphScope, type GraphScope, type KnowledgeGraph } from "../../knowledge/graph/graph.types.js";

class InMemoryGraphStorage implements GraphStorage {
  private graph: KnowledgeGraph = { nodes: [], edges: [] };
  load() { return this.graph; }
  save(graph: KnowledgeGraph) { this.graph = graph; }
}

function repo() { return new GraphRepository(new InMemoryGraphStorage()); }
function node(scope: GraphScope, label: string) {
  return { id: `input-${label}`, scope, type: "concept" as const, label, createdAt: new Date().toISOString() };
}

test("same labels coexist and remain isolated by tenant", () => {
  const repository = repo(); const a = tenantGraphScope("tenant-a"); const b = tenantGraphScope("tenant-b");
  const nodeA = repository.addNode(node(a, "Apollo")); const nodeB = repository.addNode(node(b, "Apollo"));
  assert.notEqual(nodeA.id, nodeB.id);
  assert.equal(repository.findByLabel(a, "Apollo")?.scope.kind, "tenant");
  const foundA = repository.findByLabel(a, "Apollo");
  const foundB = repository.findByLabel(b, "Apollo");
  assert.ok(foundA && foundA.scope.kind === "tenant");
  assert.ok(foundB && foundB.scope.kind === "tenant");
  assert.equal(foundA.scope.tenantId, "tenant-a");
  assert.equal(foundB.scope.tenantId, "tenant-b");
  assert.equal(repository.findByLabel(a, "Missing"), undefined);
  assert.equal(repository.getNode(a, nodeB.id), undefined);
});

test("system namespace never falls back to a tenant namespace", () => {
  const repository = repo(); const system = systemGraphScope(); const a = tenantGraphScope("tenant-a");
  const systemNode = repository.addNode(node(system, "Apollo"));
  const tenantNode = repository.addNode(node(a, "Apollo"));
  assert.equal(repository.findByLabel(system, "Apollo")?.id, systemNode.id);
  assert.equal(repository.findByLabel(a, "Apollo")?.id, tenantNode.id);
  assert.equal(repository.getNode(a, systemNode.id), undefined);
});

test("neighbors are scoped and cross-tenant edges are rejected atomically", () => {
  const repository = repo(); const a = tenantGraphScope("tenant-a"); const b = tenantGraphScope("tenant-b");
  const apolloA = repository.addNode(node(a, "Apollo")); const typescriptA = repository.addNode(node(a, "TypeScript"));
  const apolloB = repository.addNode(node(b, "Apollo")); const rustB = repository.addNode(node(b, "Rust"));
  const edge = (scope: GraphScope, source: string, target: string) => ({ id: `${source}-${target}`, scope, source, target, relation: "uses", confidence: 1, createdAt: new Date().toISOString() });
  repository.addEdge(a, edge(a, apolloA.id, typescriptA.id));
  assert.deepEqual(repository.getNeighbors(a, apolloA.id).map((item) => item.id), [typescriptA.id]);
  assert.deepEqual(repository.getNeighbors(a, apolloB.id), []);
  assert.throws(() => repository.addEdge(a, edge(a, apolloA.id, rustB.id)), /endpoints/);
});
