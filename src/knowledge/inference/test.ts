import {
    runInference
} from "./inference.engine.js";


console.log(
    "Running inference..."
);


const result =
    runInference();



console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);