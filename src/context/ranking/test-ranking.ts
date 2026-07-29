import { contextRanker } from "./context.ranker.js";

const result = contextRanker.rank([
  {
    text: "Angular Native Federation usa sp-shell",
    confidence: 0.9,
    importance: 0.9,
    accessCount: 5,
    updatedAt: new Date().toISOString(),
  },

  {
    text: "Qdrant es una base vectorial",
    confidence: 0.7,
    importance: 0.5,
    accessCount: 0,
    updatedAt: "2025-01-01",
  },
]);

console.log(JSON.stringify(result, null, 2));
