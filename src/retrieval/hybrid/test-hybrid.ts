import { hybridRetriever } from "../../core/container.js";
import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";

const strategy: RetrievalStrategy = {
  mode: "hybrid",
  vectorWeight: 0.6,
  keywordWeight: 0.4,
  graphWeight: 0,
  graphEvidenceWeight: 0,
  topK: 10,
  expandQuery: false,
  rerank: true,
  temporalBoost: 0,
};

const results = await hybridRetriever.search({
  query: "Node.js TypeScript",
  strategy,
});

console.table(
  results.map((r) => ({
    source: r.source,
    score: r.score.toFixed(3),
    text: r.memory.text,
  })),
);
