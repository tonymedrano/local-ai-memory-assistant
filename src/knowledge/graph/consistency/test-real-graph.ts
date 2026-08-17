import { graphRepository } from "../graph.repository.js";

import { GraphConsistencyService } from "./graph.consistency.js";

const consistency = new GraphConsistencyService();

const graph = graphRepository.getGraph();

console.log("\n=== Real Knowledge Graph Consistency ===\n");

console.log(`Nodes: ${graph.nodes.length}`);

console.log(`Edges: ${graph.edges.length}`);

const report = consistency.validate(graph);

console.log("\nValid:", report.valid);

console.log("\nStats:");

console.log(JSON.stringify(report.stats, null, 2));

if (report.errors.length > 0) {
  console.log("\nErrors:");

  console.log(JSON.stringify(report.errors, null, 2));
}

if (report.warnings.length > 0) {
  console.log("\nWarnings:");

  console.log(JSON.stringify(report.warnings, null, 2));
}

console.log("\n=== Complete ===\n");
