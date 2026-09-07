import { buildContext } from "./model/context.builder.js";

const context = buildContext({
  query: "  Angular TypeScript  ",
  entities: [
    {
      id: "angular",
      label: "Angular",
      type: "technology",
      confidence: 0.95,
      source: "query",
    },
  ],
  topics: ["frontend"],
  project: "memory-service",
});

console.log(context);