import type { Memory } from "../../memory/memory.types.js";
import type { ContextModel } from "../../context/model/context.model.js";

import type {
  ContextAwareScoringInput,
  ContextScore,
} from "./context-aware-scoring.types.js";

const WEIGHTS = {
  projectMatch: 0.25,
  tagMatch: 0.15,
  temporalMatch: 0.15,
  memoryReference: 0.45,
} as const;

function normalize(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function calculateProjectMatch(memory: Memory, context: ContextModel): number {
  if (!context.project || !memory.project) {
    return 0.5;
  }

  return normalizeText(context.project) === normalizeText(memory.project)
    ? 1
    : 0;
}

function calculateTagMatch(memory: Memory, context: ContextModel): number {
  if (!context.topics.length) {
    return 0.5;
  }

  if (!memory.tags?.length) {
    return 0;
  }

  const tags = new Set(memory.tags.map(normalizeText));

  const matches = context.topics.filter((topic) =>
    tags.has(normalizeText(topic)),
  ).length;

  return normalize(matches / context.topics.length);
}

function calculateTemporalMatch(memory: Memory, context: ContextModel): number {
  const temporal = context.temporal;

  if (!temporal) {
    return 0.5;
  }

  const memoryTimestamp = new Date(
    memory.updatedAt ?? memory.createdAt ?? "",
  ).getTime();

  if (Number.isNaN(memoryTimestamp)) {
    return 0;
  }

  const from = temporal.from ? new Date(temporal.from).getTime() : undefined;

  const to = temporal.to ? new Date(temporal.to).getTime() : undefined;

  if (from !== undefined && Number.isNaN(from)) {
    return 0;
  }

  if (to !== undefined && Number.isNaN(to)) {
    return 0;
  }

  if (from !== undefined && memoryTimestamp < from) {
    return 0;
  }

  if (to !== undefined && memoryTimestamp > to) {
    return 0;
  }

  return 1;
}

function calculateMemoryReference(
  memory: Memory,
  context: ContextModel,
): number {
  if (!memory.id) {
    return 0;
  }

  const reference = context.memories.find((item) => item.id === memory.id);

  if (!reference) {
    return 0;
  }

  return normalize(reference.relevance);
}

export class ContextAwareScoringService {
  score(input: ContextAwareScoringInput): ContextScore {
    const { memory, context } = input;

    if (!context) {
      return {
        score: 0.5,
        projectMatch: 0.5,
        tagMatch: 0.5,
        temporalMatch: 0.5,
        memoryReference: 0.5,
      };
    }

    const components = {
      projectMatch: calculateProjectMatch(memory, context),
      tagMatch: calculateTagMatch(memory, context),
      temporalMatch: calculateTemporalMatch(memory, context),
      memoryReference: calculateMemoryReference(memory, context),
    };

    const score = normalize(
      components.projectMatch * WEIGHTS.projectMatch +
        components.tagMatch * WEIGHTS.tagMatch +
        components.temporalMatch * WEIGHTS.temporalMatch +
        components.memoryReference * WEIGHTS.memoryReference,
    );

    return {
      ...components,
      score,
    };
  }
}
