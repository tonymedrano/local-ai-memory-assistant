import { QueryAnalyzer } from "./query.analyzer.js";
import { RetrievalStrategySelector } from "./retrieval.strategy.selector.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

const queries = [
  "angular signals",
  "typescript interfaces",
  "¿qué relación existe entre Angular y TypeScript?",
  "¿qué decidimos sobre LTR ayer?",
  "cómo funciona el reranking",
  "¿cuál es la diferencia entre BM25 y RRF?",
];

for (const query of queries) {
  const profile = analyzer.analyze(query);
  const strategy = selector.select(profile);

  console.log("\n====================================");
  console.log("QUERY:", query);
  console.log("PROFILE:");
  console.dir(profile, { depth: null });

  console.log("STRATEGY:");
  console.dir(strategy, { depth: null });
}
