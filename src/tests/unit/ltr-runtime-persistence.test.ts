import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "ltr-scope-"));
const { FeedbackRepository } = await import("../../ltr/feedback/feedback.repository.js");
const { ModelRepository } = await import("../../ltr/model/model.repository.js");
const { TrainingService } = await import("../../ltr/training/training.service.js");
const { PersistentLTRModelProvider } = await import("../../ltr/model/ltr.model.provider.js");
const { DEFAULT_WEIGHTS } = await import("../../ltr/model/default-weights.js");

const a = { kind: "tenant", tenantId: "tenant-a" } as const;
const b = { kind: "tenant", tenantId: "tenant-b" } as const;
const features = (semantic: number) => ({ semantic, bm25: 0, importance: 0, confidence: 0, freshness: 0, graphEvidence: 0, accessCount: 0, diversity: 0, duplicatePenalty: 0 });

async function feedback(repository: InstanceType<typeof FeedbackRepository>, scope: { kind: "tenant"; tenantId: string }, signal: number) {
  for (let index = 0; index < 10; index++) await repository.save(scope, { query: "apollo", memoryId: `${scope.tenantId}-${index}`, type: "accept" as any, signal, features: features(signal > 0 ? 1 : 2), });
}

test("scoped training persists and reloads independent tenant models", async () => {
  const feedbackRepository = new FeedbackRepository(path.join(process.env.DATA_DIR!, "feedback.json"));
  const models = new ModelRepository();
  await feedback(feedbackRepository, a, 1); await feedback(feedbackRepository, b, -1);
  const training = new TrainingService(feedbackRepository, models);
  await training.train(a); await training.train(b);
  const modelA = models.loadScoped(a)!; const modelB = models.loadScoped(b)!;
  assert.notDeepEqual(modelA.weights, modelB.weights);
  const beforeB = structuredClone(modelB.weights);
  await feedback(feedbackRepository, a, 1); await training.train(a);
  assert.deepEqual(models.loadScoped(b)!.weights, beforeB);
  const reloaded = new PersistentLTRModelProvider(new ModelRepository());
  assert.deepEqual(reloaded.getModel(a).getWeights(), models.loadScoped(a)!.weights);
  assert.deepEqual(reloaded.getModel(b).getWeights(), beforeB);
});

test("missing scoped model ignores legacy global model", () => {
  writeFileSync(path.join(process.env.DATA_DIR!, "ltr-model.json"), JSON.stringify({ weights: { ...DEFAULT_WEIGHTS, semantic: 999 } }));
  const provider = new PersistentLTRModelProvider(new ModelRepository());
  assert.equal(provider.getModel({ kind: "tenant", tenantId: "missing" }).getWeights().semantic, DEFAULT_WEIGHTS.semantic);
  assert.throws(() => provider.getModel({ kind: "system" }), /tenant scope/);
});
