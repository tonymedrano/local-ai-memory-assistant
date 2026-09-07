import { FeatureStorage } from "../storage/feature.storage.js";
import { DatasetBuilder } from "./dataset.builder.js";

const storage = new FeatureStorage();

storage.save({
  query: "angular federation",
  memoryId: "memory-001",
  features: {
    semantic: 0.92,
    bm25: 0.81,
    importance: 0.7,
  },
});

storage.save({
  query: "angular federation",
  memoryId: "memory-002",
  features: {
    semantic: 0.35,
    bm25: 0.22,
    importance: 0.4,
  },
});

const builder = new DatasetBuilder(storage);

const dataset = builder.build(
  new Map([
    ["memory-001", 1],
    ["memory-002", 0],
  ]),
);

console.log(JSON.stringify(dataset, null, 2));
