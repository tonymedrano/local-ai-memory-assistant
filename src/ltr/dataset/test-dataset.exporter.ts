import { DatasetExporter } from "./dataset.exporter.js";

const exporter = new DatasetExporter("./data/ltr/training-dataset.jsonl");

await exporter.export([
  {
    query: "angular federation",
    memoryId: "memory-001",
    features: {
      semantic: 0.92,
      bm25: 0.81,
      importance: 0.7,
    },
    label: 1,
  },

  {
    query: "angular federation",
    memoryId: "memory-002",
    features: {
      semantic: 0.35,
      bm25: 0.22,
      importance: 0.4,
    },
    label: 0,
  },
]);

console.log("Dataset exported");
