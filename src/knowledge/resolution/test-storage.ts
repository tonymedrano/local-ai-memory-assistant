import { resolutionStorage } from "./resolution.storage.js";

resolutionStorage.add({
  subject: "angular",

  object: "typescript",

  accepted: "angular-uses-typescript",

  rejected: "angular-not-uses-typescript",

  decision: "keep",

  scores: [],

  reasoning: ["Documentation has higher reliability"],

  createdAt: new Date().toISOString(),
});

console.log(resolutionStorage.getAll());
