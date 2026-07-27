import { findNodeByLabel, getRelations, getIncomingRelations } from "./graph.service.js";

console.log(
    "Find Angular:",
    findNodeByLabel("Angular")
);


console.log(
    "Angular relations:",
    getRelations("angular")
);


console.log(
    "TypeScript incoming:",
    getIncomingRelations("typescript")
);
