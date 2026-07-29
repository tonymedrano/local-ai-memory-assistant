import { KnowledgeRepository } from "../knowledge.repository.js";

import { KnowledgeMutation } from "./knowledge.mutation.js";

import { FeedbackPipeline } from "./feedback.pipeline.js";

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

const pipeline = new FeedbackPipeline(mutation);

const result = await pipeline.process({
  subject: "angular",

  object: "typescript",

  decision: "keep",

  accepted: knowledge.id,

  rejected: undefined,

  scores: [],

  reasoning: ["Accepted by resolution engine"],

  createdAt: new Date().toString(),
});

console.log(JSON.stringify(result, null, 2));
