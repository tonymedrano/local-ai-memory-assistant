import { KnowledgeRepository } from "../knowledge.repository.js";

import { KnowledgeMutation } from "./knowledge.mutation.js";

const repository = new KnowledgeRepository();

const knowledge = await repository.save({
  type: "technology",

  subject: "Angular",

  content: "Frontend framework",

  confidence: 0.8,

  relations: [],

  createdAt: new Date(),
});

const mutation = new KnowledgeMutation(repository);

if (!knowledge.id) {
  throw new Error("Knowledge id missing");
}

const result = await mutation.apply(knowledge.id, "boost");

console.log(JSON.stringify(result, null, 2));
