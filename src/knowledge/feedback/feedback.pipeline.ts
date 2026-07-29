import { applyFeedback } from "./feedback.service.js";

import { KnowledgeMutation } from "./knowledge.mutation.js";

import type { KnowledgeResolution } from "../resolution/resolution.types.js";

export class FeedbackPipeline {
  constructor(private mutation: KnowledgeMutation) {}

  async process(resolution: KnowledgeResolution) {
    if (resolution.decision !== "keep") {
      return null;
    }

    if (!resolution.accepted) {
      return null;
    }

    const knowledge = await this.mutation.apply(resolution.accepted, "boost");

    return knowledge;
  }
}
