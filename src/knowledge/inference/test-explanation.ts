import {
  explain
} from "./explanation.engine.js";


console.log(
  "Explanation:"
);


const result =
  explain(
    "f15b71fb-4286-4d38-a0c0-e2961be552e1",
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