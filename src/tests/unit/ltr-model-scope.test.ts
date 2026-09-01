import assert from "node:assert/strict";
import { test } from "node:test";
import { PersistentLTRModelProvider } from "../../ltr/model/ltr.model.provider.js";

const a = { kind: "tenant", tenantId: "tenant-a" } as const;
const b = { kind: "tenant", tenantId: "tenant-b" } as const;

test("provider loads only the requested scoped model", () => {
  const repository = {
    loadScoped(scope: typeof a) {
      return scope.tenantId === "tenant-a"
        ? { version: 1, trainedAt: "", samples: 1, weights: { semantic: 1, bm25: 0, importance: 0 } }
        : null;
    },
  };
  const provider = new PersistentLTRModelProvider(repository as any);
  assert.equal(provider.getModel(a).getWeights().semantic, 1);
  assert.notEqual(provider.getModel(b).getWeights().semantic, 1);
});

test("provider rejects system learned-model access", () => {
  const provider = new PersistentLTRModelProvider({ loadScoped: () => null } as any);
  assert.throws(() => provider.getModel({ kind: "system" }), /requires tenant scope/);
});
