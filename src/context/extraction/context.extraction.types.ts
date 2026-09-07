import type {
  ContextConstraint,
  ContextEntity,
  ContextGoal,
  TemporalContext,
} from "../model/context.types.js";

export interface ContextExtractionResult {
  entities: ContextEntity[];
  topics: string[];
  goals: ContextGoal[];
  temporal?: TemporalContext;
  constraints: ContextConstraint[];
}
