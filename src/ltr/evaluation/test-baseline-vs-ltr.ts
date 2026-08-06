import { benchmarkDataset } from "./benchmark.dataset.js";

console.log("=== BASELINE VS LTR ===");

for (const item of benchmarkDataset) {
  console.log("\nQUERY:");
  console.log(item.query);

  console.log("\nEXPECTED:");
  console.log(item.expected);
}
