import assert from "node:assert/strict";
import test from "node:test";
import { MemoryRepository } from "../../memory/memory.repository.js";
import { VectorRetriever } from "../../retrieval/vector/vector.retriever.js";
import { KeywordRetriever } from "../../retrieval/keyword/keyword.retriever.js";
import { KeywordIndex } from "../../retrieval/index/keyword.index.js";
import { HybridRetriever } from "../../retrieval/hybrid/hybrid.retriever.js";
import { WeightedReciprocalRankFusion } from "../../retrieval/hybrid/weighted.rrf.js";
import { SemanticReranker } from "../../retrieval/reranking/semantic.reranker.js";
import { ContextBuilder } from "../../context/context.builder.js";
import { tenantGraphScope } from "../../knowledge/graph/graph.types.js";
import { knowledgeExtractionJob } from "../../jobs/knowledge-extraction.job.js";

const marker = "delete-me-apollo-7391";
const point = { id: "A1", vector: [1], payload: { id: "A1", tenantId: "tenant-a", text: marker, importance: 1, confidence: 1 } };
let points = [point];
const client = {
  async upsert() {}, async setPayload() {},
  async search(_collection: string, request: any) { return points.filter((item) => !request.filter || item.payload.tenantId === request.filter.must.find((x: any) => x.key === "tenantId")?.match.value).map((item) => ({ id: item.id, score: 1, payload: item.payload })); },
  async scroll(_collection: string, request: any) { return { points: points.filter((item) => !request.filter || item.payload.tenantId === request.filter.must[0]?.match?.value) }; },
  async delete(_collection: string, request: any) { points = points.filter((item) => !request.points.includes(item.id)); },
};
const repository = new MemoryRepository(client as any);
const index = new KeywordIndex(); index.add(point.payload as any);

test("hard deletion cannot be returned by vector or keyword retrieval", async () => {
  const vector = new VectorRetriever(repository, { async embed() { return [1]; } } as any);
  const keyword = new KeywordRetriever(index, repository);
  assert.equal((await vector.search(marker, { tenantId: "tenant-a" })).length, 1);
  assert.equal((await keyword.search(marker, { tenantId: "tenant-a" })).length, 1);
  await repository.delete("A1", "tenant-a");
  assert.equal(await repository.findById("A1", "tenant-a"), undefined);
  assert.equal((await vector.search(marker, { tenantId: "tenant-a" })).length, 0);
  assert.equal((await keyword.search(marker, { tenantId: "tenant-a" })).length, 0);
});

test("hybrid and context exclude deleted memory while another tenant remains visible", async () => {
  points = [point, { id: "B1", vector: [1], payload: { id: "B1", tenantId: "tenant-b", text: "delete-hybrid-B-7391", importance: 1, confidence: 1 } }];
  const vector = new VectorRetriever(repository, { async embed() { return [1]; } } as any);
  const keyword = new KeywordRetriever(index, repository);
  const hybrid = new HybridRetriever(vector, keyword, { async search() { return []; } } as any, {} as any, new WeightedReciprocalRankFusion(), new SemanticReranker());
  const request = (tenantId: string) => ({ scope: tenantGraphScope(tenantId), query: marker, options: { tenantId }, strategy: { mode: "hybrid", vectorWeight: 1, keywordWeight: 1, graphWeight: 1, graphEvidenceWeight: 1, topK: 5, expandQuery: false, rerank: false, temporalBoost: 0 } });
  assert.ok((await hybrid.search(request("tenant-a") as any)).some((r) => r.memory.id === "A1"));
  const builder = new ContextBuilder({ async retrieve() { return { memories: await hybrid.search(request("tenant-a") as any) }; } } as any);
  assert.ok((await builder.build(tenantGraphScope("tenant-a"), marker, undefined, "tenant-a")).memories.some((m: any) => m.item.text === marker));
  await repository.delete("A1", "tenant-a");
  assert.ok(!(await hybrid.search(request("tenant-a") as any)).some((r) => r.memory.id === "A1" || r.memory.text === marker));
  assert.ok(!(await builder.build(tenantGraphScope("tenant-a"), marker, undefined, "tenant-a")).memories.some((m: any) => m.item.text === marker));
  assert.ok((await hybrid.search({ ...request("tenant-b"), query: "delete-hybrid-B-7391" } as any)).some((r) => r.memory.id === "B1"));
});

test("deleted pending memory never reaches extraction or sync", async () => {
  let extracted = 0; let synced = 0;
  await knowledgeExtractionJob({ scope: { kind: "tenant", tenantId: "tenant-a" }, memoryRepository: { async findPendingKnowledgeExtraction() { return []; }, async markKnowledgeExtracted() { throw new Error("must not mark deleted memory"); } } as any, knowledgeService: { async processMemory() { extracted++; return { subject: "unexpected" }; } } as any, knowledgeSyncService: { async sync() { synced++; return { valid: true, errors: [] }; } } as any });
  assert.equal(extracted, 0); assert.equal(synced, 1);
});
