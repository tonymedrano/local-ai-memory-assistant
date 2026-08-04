import { hybridRetriever } from "../../core/container.js";

const results = await hybridRetriever.search("Node.js TypeScript");

console.table(
  results.map((r) => ({
    source: r.source,
    score: r.score.toFixed(3),
    text: r.memory.text,
  })),
);
