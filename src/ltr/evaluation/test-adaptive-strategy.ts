import { retrievalPipeline } from "../../core/container.js";

import { AdaptiveStrategyRunner } from "./adaptive.strategy.runner.js";

const runner = new AdaptiveStrategyRunner(
  retrievalPipeline,
);

const queries = [
  "angular",
  "angular signals",
  "node docker qdrant",
  "how does LTR ranking work",
  "fix qdrant connection error",
];

for (const query of queries) {
  const result = await runner.run(query);

  console.log("\n================================");
  console.log("QUERY:", result.query);
  console.log("STRATEGY:", result.strategy.name);
  console.log("CANDIDATE LIMIT:", result.strategy.candidateLimit);
  console.log("REASON:", result.reason);
  console.log("RESULTS:", result.results);
  console.log("LATENCY:", result.elapsedMs, "ms");
}