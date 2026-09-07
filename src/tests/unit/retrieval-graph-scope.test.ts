import assert from "node:assert/strict";
import { test } from "node:test";
import { SemanticExpander } from "../../retrieval/expansion/semantic.expander.js";
import { GraphRetriever } from "../../retrieval/graph/graph.retriever.js";

const scopeA = { kind: "tenant", tenantId: "tenant-a" } as const;
const scopeB = { kind: "tenant", tenantId: "tenant-b" } as const;

test("semantic expander requires and preserves caller scope", () => {
  const expandedA = new SemanticExpander().expand(scopeA, "Apollo");
  const expandedB = new SemanticExpander().expand(scopeB, "Apollo");
  assert.deepEqual(expandedA.entities, ["Apollo"]);
  assert.deepEqual(expandedB.entities, ["Apollo"]);
});

test("graph retriever does not resolve a foreign or global label", async () => {
  const retriever = new GraphRetriever();
  assert.deepEqual(await retriever.search(scopeA, "Apollo"), []);
  assert.deepEqual(await retriever.search(scopeB, "Apollo"), []);
});
