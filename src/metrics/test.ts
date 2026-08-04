import { InMemoryMetricsRepository } from "./metrics.repository.js";
import { MetricsService } from "./metrics.service.js";

import type { TraceResult } from "../profiling/profiling.types.js";

const repository = new InMemoryMetricsRepository();

const metrics = new MetricsService(repository);

const traces: TraceResult[] = [
  {
    id: "1",
    query: "Angular",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 180,
    steps: [
      { name: "Hybrid Retrieval", duration: 120 },
      { name: "Reranking", duration: 50 },
      { name: "Quality Scoring", duration: 5 },
      { name: "Duplicate Detection", duration: 3 },
      { name: "Diversity Filtering", duration: 2 },
    ],
  },
  {
    id: "2",
    query: "Qdrant",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 220,
    steps: [
      { name: "Hybrid Retrieval", duration: 150 },
      { name: "Reranking", duration: 60 },
      { name: "Quality Scoring", duration: 5 },
      { name: "Duplicate Detection", duration: 3 },
      { name: "Diversity Filtering", duration: 2 },
    ],
  },
  {
    id: "3",
    query: "TypeScript",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 160,
    steps: [
      { name: "Hybrid Retrieval", duration: 100 },
      { name: "Reranking", duration: 50 },
      { name: "Quality Scoring", duration: 5 },
      { name: "Duplicate Detection", duration: 3 },
      { name: "Diversity Filtering", duration: 2 },
    ],
  },
];

for (const trace of traces) {
  await metrics.record(trace);
}

const snapshot = await metrics.snapshot();

console.log("\n==============================");
console.log(" Metrics Snapshot");
console.log("==============================\n");

console.log(snapshot);

console.log("\nStage Statistics\n");

console.table(snapshot.stageStats);

console.log("\n✅ MetricsService test passed.");