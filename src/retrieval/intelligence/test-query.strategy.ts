import { QueryAnalyzer } from "./query.analyzer.js";
import { RetrievalStrategySelector } from "../strategy/retrieval.strategy.selector.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

const cases = [
  "angular",
  "angular signals",
  "node docker qdrant",
  "how does LTR ranking work",
  "what is the relationship between Angular and TypeScript",
  "compare Angular and React",
  "fix qdrant connection error",
  "show me recent decisions about the memory service",
];

for (const query of cases) {
  const profile = analyzer.analyze(query);
  const strategy = selector.select(profile);

  console.log(`\n=== ${query} ===`);

  console.log("PROFILE");
  console.dir(profile, { depth: null });

  console.log("STRATEGY");
  console.dir(strategy, { depth: null });
}