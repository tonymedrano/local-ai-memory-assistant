import { KnowledgeProvider } from "./providers/knowledge.provider.js";
import { InferenceProvider } from "./providers/inference.provider.js";
import { ExplanationProvider } from "./providers/explanation.provider.js";

import { contextRanker } from "./ranking/context.ranker.js";

import type { ContextResult } from "./context.types.js";

import type { RetrievalPipeline } from "../retrieval/pipeline/retrieval.pipeline.js";

export class ContextBuilder {
  private readonly knowledge = new KnowledgeProvider();
  private readonly inference = new InferenceProvider();
  private readonly explanation = new ExplanationProvider();

  constructor(private readonly retrievalPipeline: RetrievalPipeline) {}

  async build(query: string): Promise<ContextResult> {
    const retrieval = await this.retrievalPipeline.retrieve({
      query,
      limit: 5,
    });

    const knowledge = await this.knowledge.search(query);

    const inference = this.inference.search();

    const explanations = this.explanation.search(inference);

    const memories = retrieval.memories.map((result) => result.memory);

    const rankedMemories = contextRanker.rank(memories);

    const rankedKnowledge = contextRanker.rank(knowledge);

    const rankedInference = contextRanker.rank(inference);

    return {
      memories: rankedMemories,
      knowledge: rankedKnowledge,
      inference: rankedInference,
      explanations,
    };
  }
}
