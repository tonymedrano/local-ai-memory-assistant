import {
    graphRepository
} from "../graph/graph.repository.js";


import {
    runInference
} from "./inference.engine.js";



graphRepository.addEdge({

    id:"typescript-uses-node",

    source:"typescript",

    target:"node.js",

    relation:"uses",

    confidence:0.8,

    createdAt:
        new Date()
        .toISOString()

});



console.log(
    runInference()
);