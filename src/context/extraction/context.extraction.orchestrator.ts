import { ContextConstraintExtractor } from "./context.constraint.extractor.js";
import { ContextEntityExtractor } from "./context.entity.extractor.js";
import { ContextGoalExtractor } from "./context.goal.extractor.js";
import { ContextTemporalExtractor } from "./context.temporal.extractor.js";
import { ContextTopicExtractor } from "./context.topic.extractor.js";

import type { ContextExtractionResult } from "./context.extraction.types.js";

export class ContextExtractionOrchestrator {
  constructor(
    private readonly entityExtractor = new ContextEntityExtractor(),
    private readonly topicExtractor = new ContextTopicExtractor(),
    private readonly goalExtractor = new ContextGoalExtractor(),
    private readonly temporalExtractor = new ContextTemporalExtractor(),
    private readonly constraintExtractor =
      new ContextConstraintExtractor(),
  ) {}

  extract(
    query: string,
    referenceTime: Date = new Date(),
  ): ContextExtractionResult {
    const entities = this.entityExtractor.extract(query);

    const topics = this.topicExtractor.extract(
      query,
      entities,
    );

    const goals = this.goalExtractor.extract(query);

    const temporal = this.temporalExtractor.extract(
      query,
      referenceTime,
    );

    const constraints = this.constraintExtractor.extract(
      query,
      "query",
    );

    return {
      entities,
      topics,
      goals,
      temporal,
      constraints,
    };
  }
}
