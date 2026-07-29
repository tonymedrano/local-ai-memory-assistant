import type { ContextResult } from "../context.types.js";
import type { OptimizationOptions } from "./optimizer.types.js";

export class ContextOptimizer {
  optimize(
    context: ContextResult,
    options: OptimizationOptions = {},
  ): ContextResult {
    return {
      ...context,

      memories: context.memories.slice(0, options.maxMemories ?? 10),

      knowledge: context.knowledge.slice(0, options.maxKnowledge ?? 10),

      inference: context.inference.slice(0, options.maxDerived ?? 10),

      explanations: context.explanations.slice(0, options.maxDerived ?? 10),
    };
  }
}
