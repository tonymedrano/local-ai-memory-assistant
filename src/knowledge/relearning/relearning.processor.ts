import { KnowledgeMutation } from "../feedback/knowledge.mutation.js";

import { RelearningService } from "./relearning.service.js";

export class RelearningProcessor {
  constructor(
    private relearning: RelearningService,

    private mutation: KnowledgeMutation,
  ) {}

  async process(knowledgeId: string, confidence: number) {
    const result = this.relearning.evaluate(knowledgeId, confidence);

    await this.mutation.apply(knowledgeId, result.decision);

    return result;
  }
}
