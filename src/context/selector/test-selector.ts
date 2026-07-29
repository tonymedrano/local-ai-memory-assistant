import { ContextSelector } from "./context.selector.js";

const selector = new ContextSelector();

const result = selector.select(
  {
    memories: [
      {
        item: {
          text: "Usamos Qdrant como base vectorial local",
          type: "decision",
        },
        score: 0.9,
      },
      {
        item: {
          text: "Implementamos MCP server",
          type: "code",
        },
        score: 0.8,
      },
    ],

    knowledge: [],
    inference: [],
    explanations: [],
  } as any,

  {
    intent: "decision",
  },
);

console.log(JSON.stringify(result, null, 2));
