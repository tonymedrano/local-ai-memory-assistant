import { InMemoryMetricsRepository } from "../metrics/metrics.repository.js";
import { MetricsService } from "../metrics/metrics.service.js";

import { DashboardService } from "./dashboard.service.js";

import type { TraceResult } from "../profiling/profiling.types.js";

const repository = new InMemoryMetricsRepository();

const metrics = new MetricsService(repository);

const dashboard = new DashboardService(metrics);

const traces: TraceResult[] = [
  {
    id: "1",
    query: "Angular",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 180,
    steps: [
      {
        name: "Hybrid Retrieval",
        duration: 120,
      },
      {
        name: "Reranking",
        duration: 50,
      },
      {
        name: "Quality Scoring",
        duration: 5,
      },
      {
        name: "Duplicate Detection",
        duration: 3,
      },
      {
        name: "Diversity Filtering",
        duration: 2,
      },
    ],
  },

  {
    id: "2",
    query: "Qdrant",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 220,
    steps: [
      {
        name: "Hybrid Retrieval",
        duration: 150,
      },
      {
        name: "Reranking",
        duration: 60,
      },
      {
        name: "Quality Scoring",
        duration: 5,
      },
      {
        name: "Duplicate Detection",
        duration: 3,
      },
      {
        name: "Diversity Filtering",
        duration: 2,
      },
    ],
  },

  {
    id: "3",
    query: "TypeScript",
    startedAt: new Date(),
    finishedAt: new Date(),
    totalDuration: 160,
    steps: [
      {
        name: "Hybrid Retrieval",
        duration: 100,
      },
      {
        name: "Reranking",
        duration: 50,
      },
      {
        name: "Quality Scoring",
        duration: 5,
      },
      {
        name: "Duplicate Detection",
        duration: 3,
      },
      {
        name: "Diversity Filtering",
        duration: 2,
      },
    ],
  },
];

for (const trace of traces) {
  await metrics.record(trace);
}

const data = await dashboard.getDashboard();

console.log("\n==============================");
console.log(" Dashboard");
console.log("==============================\n");

console.dir(data, {
  depth: null,
});

console.log("\nStages\n");

console.table(data.stages);

console.log("\nLatency\n");

console.table([data.latency]);

console.log("\nRetrieval\n");

console.table([data.retrieval]);

console.log("\n✅ DashboardService test passed.");
