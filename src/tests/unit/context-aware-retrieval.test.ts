import assert from "node:assert/strict";
import test from "node:test";

import { createConfig } from "../../config.js";
import { ContextBuilder } from "../../context/context.builder.js";
import { buildContext } from "../../context/model/context.builder.js";
import type { ContextModel } from "../../context/model/context.model.js";
import { applyContextToRetrievalStrategy } from "../../context/retrieval/context.retrieval.pipeline.js";
import type { QueryProfile } from "../../retrieval/intelligence/query.types.js";
import { RetrievalPipeline } from "../../retrieval/pipeline/retrieval.pipeline.js";
import type { RetrievalStrategy } from "../../retrieval/strategy/retrieval.strategy.js";

function context(): ContextModel {
  return buildContext({
    query: "retrieve project evidence",
    entities: [
      { id: "angular", label: "Angular", confidence: 1, source: "query" },
      { id: "typescript", label: "TypeScript", confidence: 1, source: "query" },
    ],
    goals: [
      { id: "goal", description: "retrieve evidence", priority: 1 },
    ],
  });
}

test("context feature flag defaults to enabled and supports rollback", () => {
  assert.equal(createConfig({}).contextAwareRetrieval, true);
  assert.equal(
    createConfig({ CONTEXT_AWARE_RETRIEVAL: "false" }).contextAwareRetrieval,
    false,
  );
  assert.throws(
    () => createConfig({ CONTEXT_AWARE_RETRIEVAL: "sometimes" }),
    /CONTEXT_AWARE_RETRIEVAL must be either true or false/,
  );
});

test("ContextBuilder passes the extracted context to retrieval", async () => {
  let receivedRequestContext: ContextModel | undefined;
  let receivedArgumentContext: ContextModel | undefined;
  const retrievalPipeline = {
    async retrieve(
      request: { context?: ContextModel },
      retrievalContext?: ContextModel,
    ) {
      receivedRequestContext = request.context;
      receivedArgumentContext = retrievalContext;

      return { memories: [], elapsedMs: 0 };
    },
  } as unknown as RetrievalPipeline;
  const retrievalContext = context();

  await new ContextBuilder(retrievalPipeline).build(
    retrievalContext.query,
    retrievalContext,
  );

  assert.equal(receivedRequestContext, retrievalContext);
  assert.equal(receivedArgumentContext, retrievalContext);
});

test("context hints cannot override an explicit query strategy", () => {
  const baseStrategy: RetrievalStrategy = {
    mode: "hybrid",
    vectorWeight: 1,
    keywordWeight: 1,
    graphWeight: 1,
    graphEvidenceWeight: 1,
    topK: 5,
    expandQuery: false,
    rerank: false,
    temporalBoost: 0,
  };
  const profile: QueryProfile = {
    query: 'find "exact evidence"',
    tokenCount: 3,
    specificity: 1,
    complexity: 0,
    semanticIntent: 0,
    keywordIntent: 1,
    relationalIntent: 0,
    temporalIntent: 0,
    comparisonIntent: 0,
    hasExactTerms: true,
    hasEntities: false,
    entities: [],
  };
  const contextWithKnowledgeHint = buildContext({
    query: profile.query,
    topics: ["knowledge"],
  });

  const { strategy } = applyContextToRetrievalStrategy(
    baseStrategy,
    profile,
    contextWithKnowledgeHint,
  );

  assert.equal(strategy.mode, "hybrid");
  assert.equal(baseStrategy.mode, "hybrid");
});

test("RetrievalPipeline applies context strategy adjustments without mutating explicit strategy", async () => {
  const baseStrategy: RetrievalStrategy = {
    mode: "hybrid",
    vectorWeight: 1,
    keywordWeight: 1,
    graphWeight: 1,
    graphEvidenceWeight: 1,
    topK: 5,
    expandQuery: false,
    rerank: false,
    temporalBoost: 0,
  };
  const retrievalContext = context();
  let receivedStrategy: RetrievalStrategy | undefined;
  let receivedContext: ContextModel | undefined;

  const pipeline = new RetrievalPipeline(
    {
      async search(request: {
        strategy?: RetrievalStrategy;
        context?: ContextModel;
      }) {
        receivedStrategy = request.strategy;
        receivedContext = request.context;
        return [];
      },
    } as never,
    { rank: () => [] } as never,
    { rerank: async () => [] } as never,
    { score: async () => [] } as never,
    { removeDuplicates: async () => ({ results: [], duplicatesRemoved: 0 }) } as never,
    { filter: async () => [] } as never,
  );

  await pipeline.retrieve({
    query: retrievalContext.query,
    context: retrievalContext,
    options: { strategy: baseStrategy },
  });

  assert.equal(receivedContext, retrievalContext);
  assert.equal(receivedStrategy?.vectorWeight, 1.1);
  assert.equal(receivedStrategy?.graphWeight, 1.1);
  assert.equal(receivedStrategy?.graphEvidenceWeight, 1.1);
  assert.equal(baseStrategy.vectorWeight, 1);
  assert.equal(baseStrategy.graphWeight, 1);
});
