import { graphRepository } from "../graph/graph.repository.js";

import { detectConflicts } from "./conflict.engine.js";

graphRepository.addEdge({
  id: "angular-not-uses-typescript",

  source: "angular",

  target: "typescript",

  relation: "does-not-use",

  confidence: 0.7,

  createdAt: new Date().toISOString(),
});

console.log("Conflicts:");

console.log(JSON.stringify(detectConflicts(), null, 2));
