import { QueryAnalyzer } from "../intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "../strategy/retrieval.strategy.selector.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

const queries = [
  "angular",
  "angular signals",
  "typescript interfaces",
  "node docker qdrant",
  "how does LTR ranking work",
  "memory service",
  "knowledge graph inference",
  "fix qdrant connection error",
  "what is the relationship between Angular and TypeScript",
  "compare Angular and React",
];

for (const query of queries) {
  const profile = analyzer.analyze(query);
  const strategy = selector.select(profile);

  console.log(`\n=== ${query} ===`);

  console.log("PROFILE");
  console.log({
    tokenCount: profile.tokenCount,
    specificity: profile.specificity,
    complexity: profile.complexity,
    semanticIntent: profile.semanticIntent,
    keywordIntent: profile.keywordIntent,
    relationalIntent: profile.relationalIntent,
    comparisonIntent: profile.comparisonIntent,
    temporalIntent: profile.temporalIntent,
    hasExactTerms: profile.hasExactTerms,
  });

  console.log("STRATEGY");
  console.log(strategy);
}