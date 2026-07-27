import {
    explain
} from "./explanation.engine.js";


console.log(
    "Explanation:"
);


const result =
    explain(
        "angular",
        "requires",
        "typescript"
    );


console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);