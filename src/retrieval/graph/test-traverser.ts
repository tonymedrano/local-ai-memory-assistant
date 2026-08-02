import { GraphTraverser } from "./graph.traverser.js";

const traverser = new GraphTraverser();

const queries = [
  ["Angular"],
  ["TypeScript"],
  ["Node.js"],
  ["Angular", "TypeScript"],
];

for (const entities of queries) {
  console.log("\n====================================");
  console.log("Entities:", entities.join(", "));
  console.log("====================================");

  const results = traverser.traverse(entities);

  console.table(
    results.map((r) => ({
      node: r.node.label,
      type: r.node.type,
      distance: r.distance,
      score: r.score.toFixed(2),
      path: r.path.map((p) => p.label).join(" -> "),
    })),
  );
}