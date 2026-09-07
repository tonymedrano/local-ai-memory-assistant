import type { ContextModel } from "../model/context.model.js";

export interface ContextRetrievalSignals {
  entities: string[];
  topics: string[];
  goalTerms: string[];
  temporalFrom?: string;
  temporalTo?: string;
  constraints: Array<{
    type: string;
    value: string;
  }>;
}

export function buildContextRetrievalSignals(
  context: ContextModel,
): ContextRetrievalSignals {
  return {
    entities: context.entities.map((entity) => entity.label),
    topics: [...context.topics],
    goalTerms: context.goals.flatMap((goal) =>
      goal.description
        .split(/\s+/)
        .map((term) => term.trim())
        .filter(Boolean),
    ),
    temporalFrom: context.temporal?.from,
    temporalTo: context.temporal?.to,
    constraints: context.constraints.map((constraint) => ({
      type: constraint.type,
      value: constraint.value,
    })),
  };
}
