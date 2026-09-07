import { retrievalPipeline } from "../../core/container.js";
import { AdaptiveStrategyRunner } from "./adaptive.strategy.runner.js";

const runner = new AdaptiveStrategyRunner(retrievalPipeline);

const queries = [
  "angular signals",
  "how does Angular relate to TypeScript",
  "compare Angular and React",
  "what did we decide about the memory service",
  "Qdrant retrieval pipeline",
];

for (const query of queries) {
  console.log("\n========================================");
  console.log("QUERY:", query);

  const result = await runner.run(query);

  console.log("\n--- RESULTS ---");

  console.log(result.results);

  console.log("\n--- ELAPSED ---");

  console.log(`${result.elapsedMs} ms`);
}