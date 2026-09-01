import assert from "node:assert/strict";
import { test } from "node:test";
import { GraphTraverser } from "../../retrieval/graph/graph.traverser.js";
import type { GraphEdge, GraphNode, GraphScope } from "../../knowledge/graph/graph.types.js";

const a: GraphScope = { kind: "tenant", tenantId: "tenant-a" };
const b: GraphScope = { kind: "tenant", tenantId: "tenant-b" };
const node = (id: string, label: string, scope: GraphScope): GraphNode => ({ id, label, scope, type: "concept", createdAt: new Date().toISOString() });
const edge = (id: string, source: string, target: string, scope: GraphScope): GraphEdge => ({ id, source, target, scope, relation: "uses", confidence: 1, createdAt: new Date().toISOString() });

function repository() {
  const nodes = [node("a0", "Apollo", a), node("a1", "TypeScript", a), node("a2", "Node.js", a), node("a3", "Runtime", a), node("b0", "Apollo", b), node("b1", "Rust", b), node("b2", "Tokio", b)];
  const edges = [edge("a01", "a0", "a1", a), edge("a12", "a1", "a2", a), edge("a23", "a2", "a3", a), edge("b01", "b0", "b1", b), edge("b12", "b1", "b2", b), edge("foreign", "a2", "b0", b)];
  return {
    findByLabel: (scope: GraphScope, label: string) => nodes.find((n) => n.scope.kind === scope.kind && n.scope.kind === "tenant" && scope.kind === "tenant" && n.scope.tenantId === scope.tenantId && n.label.toLowerCase() === label.toLowerCase()),
    getEdgesFrom: (scope: GraphScope, id: string) => edges.filter((e) => e.source === id && e.scope.kind === scope.kind && e.scope.kind === "tenant" && scope.kind === "tenant" && e.scope.tenantId === scope.tenantId),
    getNode: (scope: GraphScope, id: string) => nodes.find((n) => n.id === id && n.scope.kind === scope.kind && n.scope.kind === "tenant" && scope.kind === "tenant" && n.scope.tenantId === scope.tenantId),
  };
}

test("traversal stays isolated across all hops", () => {
  const traverser = new GraphTraverser(repository() as any);
  assert.deepEqual(traverser.traverse(a, ["Apollo"], 3).map((item) => item.node.id), ["a0", "a1", "a2", "a3"]);
  assert.deepEqual(traverser.traverse(b, ["Apollo"], 2).map((item) => item.node.id), ["b0", "b1", "b2"]);
});

test("foreign start id is not traversed and foreign edge is ignored", () => {
  const traverser = new GraphTraverser(repository() as any);
  assert.deepEqual(traverser.traverse(a, ["Rust"], 2), []);
  const result = traverser.traverse(a, ["Node.js"], 2);
  assert.equal(result.some((item) => item.node.id === "b0"), false);
});
