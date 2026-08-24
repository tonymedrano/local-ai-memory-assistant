import { randomUUID } from "node:crypto";

import type {
  ContextConstraint,
  ContextEntity,
  ContextGoal,
  ContextKnowledgeReference,
  ContextMemoryReference,
  TemporalContext,
} from "./context.types.js";

import type { ContextModel } from "./context.model.js";

export interface ContextBuilderInput {
  query: string;

  entities?: ContextEntity[];
  topics?: string[];
  goals?: ContextGoal[];

  temporal?: TemporalContext;

  project?: string;

  constraints?: ContextConstraint[];

  memories?: ContextMemoryReference[];
  knowledge?: ContextKnowledgeReference[];

  confidence?: number;
}

export function buildContext(input: ContextBuilderInput): ContextModel {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    query: input.query.trim(),
    entities: input.entities ?? [],
    topics: input.topics ?? [],
    goals: input.goals ?? [],
    temporal: input.temporal,
    project: input.project,
    constraints: input.constraints ?? [],
    memories: input.memories ?? [],
    knowledge: input.knowledge ?? [],
    confidence: normalizeConfidence(input.confidence ?? 1),
    createdAt: now,
  };
}

function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}
