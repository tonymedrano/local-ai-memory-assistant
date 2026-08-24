import type { ContextModel } from "./context.model.js";
import type {
  ContextConstraint,
  ContextEntity,
  ContextGoal,
  ContextKnowledgeReference,
  ContextMemoryReference,
} from "./context.types.js";

export function normalizeContext(context: ContextModel): ContextModel {
  return {
    ...context,
    query: normalizeText(context.query),
    entities: context.entities.map(normalizeEntity),
    topics: normalizeStringArray(context.topics),
    goals: context.goals.map(normalizeGoal),
    temporal: context.temporal
      ? {
          ...context.temporal,
          referenceTime: normalizeText(context.temporal.referenceTime),
          from: context.temporal.from
            ? normalizeText(context.temporal.from)
            : undefined,
          to: context.temporal.to
            ? normalizeText(context.temporal.to)
            : undefined,
        }
      : undefined,
    project: context.project ? normalizeText(context.project) : undefined,
    constraints: context.constraints.map(normalizeConstraint),
    memories: context.memories.map(normalizeMemoryReference),
    knowledge: context.knowledge.map(normalizeKnowledgeReference),
  };
}

function normalizeEntity(entity: ContextEntity): ContextEntity {
  return {
    ...entity,
    id: normalizeIdentifier(entity.id),
    label: normalizeText(entity.label),
    type: entity.type ? normalizeText(entity.type) : undefined,
    confidence: normalizeScore(entity.confidence),
  };
}

function normalizeGoal(goal: ContextGoal): ContextGoal {
  return {
    ...goal,
    id: normalizeIdentifier(goal.id),
    description: normalizeText(goal.description),
    priority: normalizeScore(goal.priority),
  };
}

function normalizeConstraint(constraint: ContextConstraint): ContextConstraint {
  return {
    ...constraint,
    type: normalizeText(constraint.type),
    value: normalizeText(constraint.value),
  };
}

function normalizeMemoryReference(
  reference: ContextMemoryReference,
): ContextMemoryReference {
  return {
    ...reference,
    id: normalizeIdentifier(reference.id),
    relevance: normalizeScore(reference.relevance),
  };
}

function normalizeKnowledgeReference(
  reference: ContextKnowledgeReference,
): ContextKnowledgeReference {
  return {
    ...reference,
    id: normalizeIdentifier(reference.id),
    relevance: normalizeScore(reference.relevance),
  };
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeIdentifier(value: string): string {
  return value.trim();
}

function normalizeStringArray(values: string[]): string[] {
  const normalized = values
    .map(normalizeText)
    .filter((value) => value.length > 0);

  return [...new Set(normalized)];
}

function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}
