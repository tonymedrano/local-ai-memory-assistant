import assert from "node:assert/strict";
import { test } from "node:test";
import { LearningRanker } from "../../ltr/ranking/learning.ranker.js";
import { FeatureExtractor } from "../../ltr/features/feature.extractor.js";
import { LinearModel } from "../../ltr/model/linear.model.js";

const weights = { semantic: 1, bm25: 0, importance: 0, confidence: 0, freshness: 0, graphEvidence: 0, accessCount: 0, diversity: 0, duplicatePenalty: 0, feedbackScore: 0, retrievalFrequency: 0, ageScore: 0, contextScore: 0 };
const result = (id: string, semanticScore: number) => ({ memory: { id, text: id, importance: semanticScore, confidence: semanticScore, createdAt: new Date().toISOString() }, score: semanticScore, source: "vector" as const, semanticScore });

test("learning ranker resolves models by tenant scope", () => {
  const provider = { getModel: (scope: any) => new LinearModel({ ...weights, semantic: scope.tenantId === "tenant-a" ? 1 : -1 }) };
  const ranker = new LearningRanker(new FeatureExtractor(), provider as any);
  const a = ranker.rank({ kind: "tenant", tenantId: "tenant-a" }, [result("high", 1), result("low", 0.1)]);
  const b = ranker.rank({ kind: "tenant", tenantId: "tenant-b" }, [result("high", 1), result("low", 0.1)]);
  assert.equal(a[0].memory.id, "high");
  assert.equal(b[0].memory.id, "low");
});
