import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "ltr-ranking-"));
const { ModelRepository } = await import("../../ltr/model/model.repository.js");
const { PersistentLTRModelProvider } = await import("../../ltr/model/ltr.model.provider.js");
const { LTRRanker } = await import("../../ltr/ranking/ltr.ranker.js");
const { FeatureExtractor } = await import("../../ltr/features/feature.extractor.js");
const { DEFAULT_WEIGHTS } = await import("../../ltr/model/default-weights.js");

const a = { kind: "tenant", tenantId: "tenant-a" } as const;
const b = { kind: "tenant", tenantId: "tenant-b" } as const;
const query = "apollo database";
const candidates = [
  { memory: { id: "R1", text: "semantic", importance: 0, confidence: 0, createdAt: new Date().toISOString() }, score: 0, source: "vector" as const, semanticScore: 1, keywordScore: 0 },
  { memory: { id: "R2", text: "keyword", importance: 0, confidence: 0, createdAt: new Date().toISOString() }, score: 0, source: "keyword" as const, semanticScore: 0, keywordScore: 1 },
];

test("LTRRanker loads tenant-scoped persisted models for identical inputs", () => {
  const repository = new ModelRepository();
  repository.saveScoped(a, { version: 1, trainedAt: "", samples: 10, weights: { ...DEFAULT_WEIGHTS, semantic: 10, bm25: 0 } });
  repository.saveScoped(b, { version: 1, trainedAt: "", samples: 10, weights: { ...DEFAULT_WEIGHTS, semantic: 0, bm25: 10 } });
  const provider = new PersistentLTRModelProvider(new ModelRepository());
  const ranker = new LTRRanker(new FeatureExtractor(), provider);
  const inputA = structuredClone(candidates); const inputB = structuredClone(candidates);
  assert.equal(query, query); assert.deepEqual(inputA, inputB);
  const rankedA = ranker.rank(a, query, inputA as any);
  const rankedB = ranker.rank(b, query, inputB as any);
  assert.equal(rankedA[0].result.memory.id, "R1");
  assert.equal(rankedB[0].result.memory.id, "R2");
  assert.notDeepEqual(rankedA.map((item) => item.result.memory.id), rankedB.map((item) => item.result.memory.id));
  const reverseA = ranker.rank(a, query, structuredClone(candidates) as any);
  assert.equal(reverseA[0].result.memory.id, "R1");
});

test("ranking missing tenant model ignores another tenant persisted model", () => {
  const repository = new ModelRepository();
  repository.saveScoped(a, { version: 1, trainedAt: "", samples: 1, weights: { ...DEFAULT_WEIGHTS, semantic: 999, bm25: 0 } });
  const ranker = new LTRRanker(new FeatureExtractor(), new PersistentLTRModelProvider(new ModelRepository()));
  const rankedMissing = ranker.rank({ kind: "tenant", tenantId: "tenant-missing" }, query, structuredClone(candidates) as any);
  const rankedA = ranker.rank(a, query, structuredClone(candidates) as any);
  assert.ok(rankedMissing[0].score < rankedA[0].score);
});
