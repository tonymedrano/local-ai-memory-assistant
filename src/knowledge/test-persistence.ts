import { KnowledgeRepository } from "./knowledge.repository.js";

const repository = new KnowledgeRepository();

await repository.save({
  type: "technology",

  subject: "Angular",

  content: "Frontend framework",

  confidence: 0.9,

  relations: [],

  createdAt: new Date(),
});

console.log(await repository.findAll());
