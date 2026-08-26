import assert from "node:assert/strict";

import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "../../retrieval/strategy/retrieval.strategy.selector.js";
import { applyContextToRetrievalStrategy } from "./context.retrieval.strategy.integrator.js";
import type { ContextModel } from "../model/context.model.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

function createContext(overrides: Partial<ContextModel> = {}): ContextModel {
  return {
    id: "context-test",
    query: "test query",
    entities: [],
    topics: [],
    goals: [],
    constraints: [],
    memories: [],
    knowledge: [],
    confidence: 1,
    createdAt: "2026-08-24T00:00:00.000Z",
    ...overrides,
  };
}

function strategyFor(query: string) {
  const profile = analyzer.analyze(query);
  return selector.select(profile);
}

console.log("=== Context-Aware Retrieval Integration Tests ===");

const base = strategyFor("angular signals");

const emptyContextResult = applyContextToRetrievalStrategy(
  base,
  createContext(),
);

assert.deepEqual(
  emptyContextResult.strategy,
  base,
  "empty context should preserve strategy",
);

console.log("✓ empty context preserves base strategy");

const entityContext = createContext({
  entities: [
    {
      id: "angular",
      label: "Angular",
      confidence: 1,
      source: "query",
    },
    {
      id: "typescript",
      label: "TypeScript",
      confidence: 1,
      source: "query",
    },
  ],
});

const entityResult = applyContextToRetrievalStrategy(base, entityContext);

assert.equal(
  entityResult.strategy.graphWeight,
  base.graphWeight + 0.1,
  "multiple entities should reinforce graph retrieval",
);

console.log("✓ entities reinforce graph retrieval");

const topicContext = createContext({
  topics: ["retrieval"],
});

const topicResult = applyContextToRetrievalStrategy(base, topicContext);

assert.equal(
  topicResult.hints.preferredMode,
  "knowledge",
  "retrieval topic should produce knowledge hint",
);

assert.equal(
  topicResult.strategy.vectorWeight,
  base.vectorWeight,
  "topics alone should not alter vector weight",
);

console.log("✓ topics provide knowledge hint without overriding strategy");

const goalContext = createContext({
  goals: [
    {
      id: "goal-1",
      description: "improve retrieval quality",
      priority: 1,
    },
  ],
});

const goalResult = applyContextToRetrievalStrategy(base, goalContext);

assert.equal(
  goalResult.strategy.vectorWeight,
  base.vectorWeight + 0.1,
  "goals should reinforce semantic retrieval",
);

console.log("✓ goals reinforce semantic retrieval");

const constraintContext = createContext({
  constraints: [
    {
      type: "restriction",
      value: "MongoDB",
      source: "query",
    },
  ],
});

const constraintResult = applyContextToRetrievalStrategy(
  base,
  constraintContext,
);

assert.equal(
  constraintResult.strategy.keywordWeight,
  base.keywordWeight + 0.1,
  "constraints should reinforce keyword retrieval",
);

console.log("✓ constraints reinforce keyword retrieval");

const temporalContext = createContext({
  temporal: {
    referenceTime: "2026-08-24T00:00:00.000Z",
    from: "2026-08-23T00:00:00.000Z",
    to: "2026-08-24T00:00:00.000Z",
    isRelative: true,
  },
});

const temporalResult = applyContextToRetrievalStrategy(base, temporalContext);

assert.equal(
  temporalResult.strategy.temporalBoost,
  Math.max(base.temporalBoost, 0.1),
  "temporal context should reinforce temporal retrieval",
);

console.log("✓ temporal context reinforces temporal retrieval");

const combinedContext = createContext({
  entities: entityContext.entities,
  topics: ["retrieval"],
  goals: goalContext.goals,
  constraints: constraintContext.constraints,
  temporal: temporalContext.temporal,
});

const combinedResult = applyContextToRetrievalStrategy(base, combinedContext);

assert.equal(combinedResult.strategy.vectorWeight, base.vectorWeight + 0.1);

assert.equal(combinedResult.strategy.keywordWeight, base.keywordWeight + 0.1);

assert.equal(combinedResult.strategy.graphWeight, base.graphWeight + 0.1);

assert.equal(
  combinedResult.strategy.temporalBoost,
  Math.max(base.temporalBoost, 0.1),
);

console.log("✓ combined context produces cumulative strategy adjustments");

assert.deepEqual(
  base,
  strategyFor("angular signals"),
  "base strategy must remain immutable",
);

console.log("✓ base strategy remains immutable");

console.log("\n=== ALL CONTEXT-AWARE RETRIEVAL INTEGRATION TESTS PASSED ===");
