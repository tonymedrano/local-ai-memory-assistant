import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { GraphStorage } from "../../knowledge/graph/graph.storage.js";
import { GraphRepository } from "../../knowledge/graph/graph.repository.js";
import { tenantGraphScope } from "../../knowledge/graph/graph.types.js";

test("v2 graph persists isolated tenant namespaces across restart", () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "graph-v2-")), "knowledge-graph.json");
  const a = tenantGraphScope("tenant-a"), b = tenantGraphScope("tenant-b");
  const first = new GraphRepository(new GraphStorage(file));
  const aNode = first.addNode({ id: "a", scope: a, type: "concept", label: "apollo", createdAt: "" });
  const bNode = first.addNode({ id: "b", scope: b, type: "concept", label: "apollo", createdAt: "" });
  const disk = JSON.parse(readFileSync(file, "utf8")); assert.equal(disk.schemaVersion, 2); assert.ok(disk.graphs["tenant:tenant-a"]); assert.ok(disk.graphs["tenant:tenant-b"]);
  const reloaded = new GraphRepository(new GraphStorage(file));
  assert.equal(reloaded.getNode(a, aNode.id)?.id, aNode.id); assert.equal(reloaded.getNode(b, aNode.id), undefined); assert.equal(reloaded.getNode(b, bNode.id)?.id, bNode.id);
});

test("legacy graph is quarantined and not activated", () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "graph-legacy-")), "knowledge-graph.json");
  writeFileSync(file, JSON.stringify({ nodes: [{ id: "legacy", label: "apollo" }], edges: [] }));
  const storage = new GraphStorage(file);
  assert.equal(storage.load().nodes.length, 0); assert.ok(existsSync(`${file}.legacy-quarantine`));
});

test("corrupt v2 namespaces fail closed without partial hydration", () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "graph-corrupt-")), "knowledge-graph.json");
  const scope = { kind: "tenant", tenantId: "tenant-a" };
  writeFileSync(file, JSON.stringify({ schemaVersion: 2, graphs: { "tenant:tenant-a": { scope, nodes: [{ id: "A1", scope, type: "concept", label: "apollo", createdAt: "" }], edges: [{ id: "bad", scope, source: "A1", target: "missing", relation: "uses", confidence: 1, createdAt: "" }] } } }));
  assert.throws(() => new GraphStorage(file).load(), /endpoint/);
  assert.equal(existsSync(`${file}.legacy-quarantine`), false);
});

test("v2 scope mismatch and unknown schema are rejected, never quarantined", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "graph-schema-")); const file = path.join(directory, "knowledge-graph.json");
  writeFileSync(file, JSON.stringify({ schemaVersion: 2, graphs: { "tenant:tenant-a": { scope: { kind: "tenant", tenantId: "tenant-b" }, nodes: [], edges: [] } } }));
  assert.throws(() => new GraphStorage(file).load(), /namespace/);
  writeFileSync(file, JSON.stringify({ schemaVersion: 999, graphs: {} }));
  assert.throws(() => new GraphStorage(file), /Unsupported/);
  assert.equal(existsSync(`${file}.legacy-quarantine`), false);
});
