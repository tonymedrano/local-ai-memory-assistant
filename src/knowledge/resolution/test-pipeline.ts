import { resolveAndStore } from "./resolution.pipeline.js";

const result = resolveAndStore({
  subject: "angular",

  object: "typescript",

  evidence: [
    {
      knowledgeId: "angular-uses-typescript",

      confidence: 0.8,

      source: "documentation",

      createdAt: new Date().toISOString(),
    },

    {
      knowledgeId: "angular-not-uses-typescript",

      confidence: 0.9,

      source: "user",

      createdAt: new Date().toISOString(),
    },
  ],
});

console.log(JSON.stringify(result, null, 2));
