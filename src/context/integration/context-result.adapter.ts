import type { ContextModel } from "../model/context.model.js";
import { buildContext } from "../model/context.builder.js";
import { normalizeContext } from "../model/context.normalizer.js";
import { validateContext } from "../model/context.validator.js";

import type { ContextResult } from "../context.types.js";

export function adaptContextResult(
  query: string,
  result: ContextResult,
): ContextModel {
  const context = buildContext({
    query,

    memories: result.memories.map((entry) => ({
      id: String(entry.item.id ?? ""),
      relevance: normalizeScore(entry.score),
    })),

    knowledge: result.knowledge.map((entry) => ({
      id: String(entry.item.id ?? entry.item.subject),
      relevance: normalizeScore(entry.score),
    })),
  });

  const normalized = normalizeContext(context);

  const validation = validateContext(normalized);

  if (!validation.valid) {
    throw new Error(
      `Invalid context generated from ContextResult: ${validation.errors.join(
        "; ",
      )}`,
    );
  }

  return normalized;
}

function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
}
