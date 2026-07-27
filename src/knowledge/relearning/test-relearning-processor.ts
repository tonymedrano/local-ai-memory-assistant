import { KnowledgeRepository } from "../knowledge.repository.js";

import { KnowledgeMutation } from "../feedback/knowledge.mutation.js";

import { RelearningService } from "./relearning.service.js";

import { RelearningProcessor } from "./relearning.processor.js";

const repository = new KnowledgeRepository();

const knowledge = await repository.save({
  type: "technology",

  subject: "Angular",

  content: "Frontend framework",

  confidence: 0.8,

  relations: [],

  createdAt: new Date(),
});

if (!knowledge.id) {
  throw new Error("Knowledge id missing");
}

const mutation = new KnowledgeMutation(repository);

const relearning = new RelearningService();

const processor = new RelearningProcessor(relearning, mutation);

const result = await processor.process(knowledge.id, knowledge.confidence);

console.log(JSON.stringify(result, null, 2));

console.log(JSON.stringify(await repository.findAll(), null, 2));
