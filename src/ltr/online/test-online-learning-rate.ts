import { LearningRate } from "./online.learning-rate.js";

const lr = new LearningRate();

console.log("Step 1      :", lr.get(1));
console.log("Step 10     :", lr.get(10));
console.log("Step 100    :", lr.get(100));
console.log("Step 1000   :", lr.get(1000));
console.log("Step 10000  :", lr.get(10000));
console.log("Step 100000 :", lr.get(100000));