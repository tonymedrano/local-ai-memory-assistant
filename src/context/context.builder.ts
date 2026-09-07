import { KnowledgeProvider } from "./providers/knowledge.provider.js";
import { InferenceProvider } from "./providers/inference.provider.js";
import { ExplanationProvider } from "./providers/explanation.provider.js";

import { contextRanker } from "./ranking/context.ranker.js";

import type { ContextResult } from "./context.types.js";

import type { RetrievalPipeline } from "../retrieval/pipeline/retrieval.pipeline.js";
import type { ContextModel } from "./model/context.model.js";
import type { GraphScope } from "../knowledge/graph/graph.types.js";

export class ContextBuilder {
  private readonly knowledge = new KnowledgeProvider();
  private readonly inference = new InferenceProvider();
  private readonly explanation = new ExplanationProvider();

  constructor(private readonly retrievalPipeline: RetrievalPipeline) {}

  async build(
    scope: GraphScope,
    query: string,
    retrievalContext?: ContextModel,
    tenantId?: string,
  ): Promise<ContextResult> {
    if (scope.kind !== "tenant" || !tenantId || tenantId !== scope.tenantId) {
      throw new Error("Context scope and tenantId must match");
    }
    const retrieval = await this.retrievalPipeline.retrieve({
      query,
      limit: 5,
      options: tenantId ? { tenantId } : undefined,
      context: retrievalContext,
    }, retrievalContext);

    // Knowledge graph state is currently global. It must not be included in a
    // tenant-scoped response until the graph gains tenant ownership.
    const knowledge = tenantId ? [] : await this.knowledge.search(query);

    const inference = tenantId ? [] : this.inference.search();

    const explanations = this.explanation.search(scope, inference);

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
