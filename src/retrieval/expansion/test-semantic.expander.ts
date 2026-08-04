import { SemanticExpander } from "./semantic.expander.js";

const expander = new SemanticExpander();

const queries = [
  "Angular TypeScript",
  "Node.js",
  "Angular Native Federation",
];

for (const query of queries) {
  console.log("\n====================================");
  console.log(query);
  console.log("====================================");

  const result = expander.expand(query);

  console.dir(result, {
    depth: null,
  });
}