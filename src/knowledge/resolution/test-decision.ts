import { decideResolution } from "./decision.engine.js";

const scores = [
  {
    knowledgeId: "angular-uses-typescript",

    confidence: 0.8,

    sourceScore: 1,

    recencyScore: 1,

    totalScore: 0.88,
  },

  {
    knowledgeId: "angular-not-uses-typescript",

    confidence: 0.9,

    sourceScore: 0.7,

    recencyScore: 1,

    totalScore: 0.85,
  },
];

console.log(JSON.stringify(decideResolution(scores), null, 2));
