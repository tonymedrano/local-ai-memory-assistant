import { QueryAnalyzer } from "./query.analyzer.js";
import { StrategySelector } from "./strategy.selector.js";

const analyzer = new QueryAnalyzer();
const selector = new StrategySelector();

const queries = [
  "angular",
  "angular signals",
  "typescript interfaces",
  "node docker qdrant",
  "how does LTR ranking work",
  "memory service",
  "knowledge graph inference",
  "fix qdrant connection error",
];

for (const query of queries) {
  const analysis = analyzer.analyze(query);

  const selection = selector.select({
    specificity: analysis.specificity,
    complexity: analysis.complexity,
    semanticIntent: analysis.semanticIntent,
    tokenCount: analysis.tokenCount,
  });

  console.log(`\nQUERY: "${query}"`);

  console.log("ANALYSIS");
  console.log({
    tokenCount: analysis.tokenCount,
    specificity: analysis.specificity,
    complexity: analysis.complexity,
    semanticIntent: analysis.semanticIntent,
  });

  console.log("STRATEGY");
  console.log(selection);
}
