import type {
  ContextConstraint,
  ContextEntity,
  ContextGoal,
  ContextKnowledgeReference,
  ContextMemoryReference,
  TemporalContext,
} from "./context.types.js";

export interface ContextModel {
  id: string;

  query: string;

  entities: ContextEntity[];

  topics: string[];

  goals: ContextGoal[];

  temporal?: TemporalContext;

  project?: string;

  constraints: ContextConstraint[];

  memories: ContextMemoryReference[];

  knowledge: ContextKnowledgeReference[];

  confidence: number;

  createdAt: string;
}
