import { MemoryProvider } from "./providers/memory.provider.js";
import { KnowledgeProvider } from "./providers/knowledge.provider.js";
import { InferenceProvider } from "./providers/inference.provider.js";
import { ExplanationProvider } from "./providers/explanation.provider.js";

import type { ContextResult } from "./context.types.js";

export class ContextBuilder {
  private readonly memory = new MemoryProvider();

  private readonly knowledge = new KnowledgeProvider();

  private readonly inference = new InferenceProvider();

  private readonly explanation = new ExplanationProvider();

  async build(query: string): Promise<ContextResult> {
    const memories = await this.memory.search(query);

    const knowledge = await this.knowledge.search(query);

    const inference = this.inference.search();

    const explanations =
      this.explanation.search(inference);

    return {
      memories,
      knowledge,
      inference,
      explanations,
    };
  }
}