import { ContextPromptBuilder } from "./context.prompt.builder.js";

const builder = new ContextPromptBuilder();

const now = new Date();

const result = builder.build({
  summary: "Angular requires TypeScript",

  memories: [
    {
      id: "1",
      text: "Angular Native Federation usa sp-shell",
      importance: 0.9,
      confidence: 0.9,
      accessCount: 1,
      lastAccess: now.toISOString(),
      archived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      origin: "user",
    },
  ],

  knowledge: [
    {
      id: "1",
      type: "technology",
      subject: "Angular",
      content: "Frontend framework",
      relations: [],
      confidence: 0.95,
      createdAt: now,
    },
  ],

  derived: [
    {
      subject: "Angular",
      relation: "requires",
      object: "typescript",
      conclusion: "Angular requires TypeScript",
      reasoning: [],
      evidence: [],
      confidence: 0.8,
      createdAt: now.toISOString(),
    },
  ],
});

console.log(JSON.stringify(result, null, 2));
