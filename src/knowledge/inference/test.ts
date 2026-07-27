import {
    runInference,
    getDerivedKnowledge
} from "./inference.engine.js";


console.log(
    "Running inference..."
);


const result =
    runInference();


console.log(
    "Angular requirements:"
);


console.log(
    getDerivedKnowledge(
        "angular",
        "requires"
    )
);