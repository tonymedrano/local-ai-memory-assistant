import { KnowledgeRepository } from "../knowledge.repository.js";

import { KnowledgeMutation } from "./knowledge.mutation.js";

import { FeedbackPipeline } from "./feedback.pipeline.js";

import { FeedbackProcessor } from "./feedback.processor.js";

import { resolutionStorage } from "../resolution/resolution.storage.js";

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

// Creamos una resolución apuntando
// al knowledge real

resolutionStorage.add({
  subject: "angular",

  object: "typescript",

  decision: "keep",

  accepted: knowledge.id,

  rejected: undefined,

  scores: [],

  reasoning: ["Accepted after conflict resolution"],

  createdAt: new Date().toString(),
});

const mutation = new KnowledgeMutation(repository);

const pipeline = new FeedbackPipeline(mutation);

const processor = new FeedbackProcessor(pipeline);

const result = await processor.processAll();

console.log(JSON.stringify(result, null, 2));
