import { FeatureStorage } from "./feature.storage.js";

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

console.table(storage.getAll());
