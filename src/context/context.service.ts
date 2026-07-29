import { ContextBuilder } from "./context.builder.js";
import { ContextOptimizer } from "./optimizer/context.optimizer.js";
import { ContextCompressor } from "./compression/context.compressor.js";
import { ContextPromptBuilder } from "./prompt/context.prompt.builder.js";

import type { ContextPrompt } from "./prompt/context.prompt.types.js";
import type { OptimizationOptions } from "./optimizer/optimizer.types.js";
export class ContextService {
  private readonly builder = new ContextBuilder();
  private readonly optimizer = new ContextOptimizer();
  private readonly compressor = new ContextCompressor();
  private readonly promptBuilder = new ContextPromptBuilder();

  async build(
    query: string,
    options: OptimizationOptions = {},
  ): Promise<ContextPrompt> {
    const context = await this.builder.build(query);

    const optimized = this.optimizer.optimize(context, options);

    const compressed = this.compressor.compress(
      optimized.memories.map((m) => m.item),
      optimized.knowledge.map((k) => k.item),
      optimized.explanations,
    );

    return this.promptBuilder.build(compressed);
  }
}

const contextService = new ContextService();

export async function buildContext(query: string) {
  return contextService.build(query);
}
