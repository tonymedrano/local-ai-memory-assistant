import type { MemorySearchResult } from "../../memory/memory.repository.js";

import { buildContext } from "../model/context.builder.js";
import type { ContextModel } from "../model/context.model.js";
import { normalizeContext } from "../model/context.normalizer.js";
import { validateContext } from "../model/context.validator.js";

export function adaptMemoryResultsToContext(
  query: string,
  results: MemorySearchResult[],
): ContextModel {
  const context = buildContext({
    query,

    memories: results.map((result) => ({
      id: String(result.id),
      relevance: normalizeRelevance(result.score),
    })),

    confidence: calculateContextConfidence(results),
  });

  const normalized = normalizeContext(context);

  const validation = validateContext(normalized);

  if (!validation.valid) {
    throw new Error(
      `Invalid context generated from memory results: ${validation.errors.join(
        "; ",
      )}`,
    );
  }

  return normalized;
}

function normalizeRelevance(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(Math.max(score, 0), 1);
}

function calculateContextConfidence(results: MemorySearchResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  const total = results.reduce(
    (sum, result) => sum + normalizeRelevance(result.score),
    0,
  );

  return normalizeRelevance(total / results.length);
}
