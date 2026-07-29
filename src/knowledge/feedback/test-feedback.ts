import {
    applyFeedback
} from "./feedback.service.js";



const result =
    applyFeedback(

        "angular-uses-typescript",

        0.8,

        "boost",

        "Accepted by resolution engine"

    );



console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);