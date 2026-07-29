import {
    resolveConflict
} from "./resolution.engine.js";



const conflict = {

    subject:
        "angular",

    object:
        "typescript",

    relations: [
        "uses",
        "does-not-use"
    ],

    evidence: [
        "angular-uses-typescript",
        "angular-not-uses-typescript"
    ]

};



console.log(
    JSON.stringify(
        resolveConflict(conflict),
        null,
        2
    )
);