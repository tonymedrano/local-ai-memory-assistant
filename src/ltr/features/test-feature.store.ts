import { FeatureStore } from "./feature.store.js";

const store = new FeatureStore();

store.clear();

store.save(
    "angular federation",
    "memory-001",
    {
        semantic: 0.91,
        bm25: 0.83,
        importance: 0.75,
        confidence: 0.90,
        freshness: 0.85,
        graphEvidence: 0.4,
        accessCount: 3,
        diversity: 0.8,
        duplicatePenalty: 0
    }
);

console.log(store.count());

console.log(
    store.find(
        "angular federation",
        "memory-001"
    )
);