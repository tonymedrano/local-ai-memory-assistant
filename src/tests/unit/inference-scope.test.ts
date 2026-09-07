import assert from "node:assert/strict";
import { test } from "node:test";
import { usesImpliesRequires } from "../../knowledge/inference/inference.rules.js";

const scopeA = { kind: "tenant", tenantId: "tenant-a" } as const;
const scopeB = { kind: "tenant", tenantId: "tenant-b" } as const;

test("inference rules ignore foreign scoped resources", () => {
  const graph = {
    nodes: [
      { id: "a1", label: "Apollo", scope: scopeA },
      { id: "a2", label: "TypeScript", scope: scopeA },
      { id: "b1", label: "Apollo", scope: scopeB },
      { id: "b2", label: "Rust", scope: scopeB },
    ],
    edges: [
      { id: "a-edge", source: "a1", target: "a2", relation: "uses", confidence: 1, scope: scopeA },
      { id: "b-edge", source: "b1", target: "b2", relation: "uses", confidence: 1, scope: scopeB },
    ],
  };

  const derived = usesImpliesRequires.evaluate(graph, scopeA);
  assert.deepEqual(derived.map((item) => item.object), ["a2"]);
  assert.equal(derived.some((item) => item.object === "b2"), false);
});
