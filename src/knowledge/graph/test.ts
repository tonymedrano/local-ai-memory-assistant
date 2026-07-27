import { buildKnowledgeGraph } from "./graph.builder.js";

import { getStats, getGraph } from "./graph.service.js";
import type { GraphInputMemory } from "./graph.types.js";

const knowledge: GraphInputMemory[] = [];

console.log("Building graph...");

buildKnowledgeGraph(knowledge);

console.log(JSON.stringify(getGraph(), null, 2));

console.log("Stats:", getStats());
