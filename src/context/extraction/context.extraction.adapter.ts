import { buildContext } from "../model/context.builder.js";
import { normalizeContext } from "../model/context.normalizer.js";
import type { ContextModel } from "../model/context.model.js";
import type { ContextExtractionResult } from "./context.extraction.types.js";

export function buildContextFromExtraction(
  query: string,
  extraction: ContextExtractionResult,
): ContextModel {
  return normalizeContext(
    buildContext({
      query,
      entities: extraction.entities,
      topics: extraction.topics,
      goals: extraction.goals,
      temporal: extraction.temporal,
      constraints: extraction.constraints,
      memories: [],
      knowledge: [],
      confidence: 1,
    }),
  );
}
