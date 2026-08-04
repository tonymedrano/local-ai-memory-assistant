import type { RetrievalResult } from "../types.js";
import { SemanticReranker } from "./semantic.reranker.js";

const reranker = new SemanticReranker();

const results: RetrievalResult[] = [
  {
    memory: {
      id: "1",
      text: "Node.js requires TypeScript",
      confidence: 0.72,
    },
    score: 0.016,
    source: "hybrid",
    originalSources: ["graph-evidence"],
  },
  {
    memory: {
      id: "2",
      text: "Node.js",
      confidence: 0.8,
    },
    score: 0.016,
    source: "hybrid",
    originalSources: ["graph"],
  },
];

console.table(reranker.rerank(results, ["Node.js", "TypeScript"]));
