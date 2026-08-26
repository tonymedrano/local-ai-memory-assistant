import assert from "node:assert/strict";

import { QueryAnalyzer } from "../../retrieval/intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "../../retrieval/strategy/retrieval.strategy.selector.js";

import { applyContextToRetrievalStrategy } from "./context.retrieval.pipeline.js";

import type { ContextModel } from "../model/context.model.js";

console.log("=== Context-Aware Retrieval Pipeline Tests ===");

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

function strategyFor(query: string) {
  const profile = analyzer.analyze(query);
  return selector.select(profile);
}

function context(overrides: Partial<ContextModel>): ContextModel {
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
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/*
 * 1. No context
 */

{
  const base = strategyFor("angular signals");

  const result = applyContextToRetrievalStrategy(
    base,
    analyzer.analyze("angular signals"),
  );

  assert.deepEqual(result.strategy, base);

  console.log("✓ no context preserves strategy");
}

/*
 * 2. Goals reinforce semantic retrieval
 */

{
  const query = "angular signals";

  const profile = analyzer.analyze(query);
  const base = selector.select(profile);

  const result = applyContextToRetrievalStrategy(
    base,
    profile,
    context({
      goals: [
        {
          id: "goal-1",
          description: "entender cómo funcionan los signals",
          priority: 1,
        },
      ],
    }),
  );

  assert(
    result.strategy.vectorWeight > base.vectorWeight,
    "goal should increase vector weight",
  );

  console.log("✓ goals reinforce semantic retrieval");
}

/*
 * 3. Entities reinforce graph evidence
 */

{
  const query = "angular signals";

  const profile = analyzer.analyze(query);
  const base = selector.select(profile);

  const result = applyContextToRetrievalStrategy(
    base,
    profile,
    context({
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
    }),
  );

  assert(
    result.strategy.graphWeight > base.graphWeight,
    "entities should increase graph weight",
  );

  assert(
    result.strategy.graphEvidenceWeight > base.graphEvidenceWeight,
    "entities should increase graph evidence weight",
  );

  console.log("✓ entities reinforce graph retrieval");
}

/*
 * 4. Temporal context
 */

{
  const query = "¿qué decidimos?";

  const profile = analyzer.analyze(query);
  const base = selector.select(profile);

  const result = applyContextToRetrievalStrategy(
    base,
    profile,
    context({
      temporal: {
        referenceTime: "2026-08-24T10:00:00.000Z",
        from: "2026-08-17T00:00:00.000Z",
        to: "2026-08-24T23:59:59.000Z",
        isRelative: true,
      },
    }),
  );

  assert(
    result.strategy.temporalBoost > base.temporalBoost,
    "temporal context should increase temporal boost",
  );

  console.log("✓ temporal context reinforces temporal retrieval");
}

/*
 * 5. Explicit query intent remains authoritative
 */

{
  const query = "¿cuál es la diferencia entre Angular y TypeScript?";

  const profile = analyzer.analyze(query);
  const base = selector.select(profile);

  const result = applyContextToRetrievalStrategy(
    base,
    profile,
    context({
      topics: ["knowledge"],
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
    }),
  );

  assert.equal(
    result.strategy.mode,
    base.mode,
    "context must not override explicit comparison intent",
  );

  console.log("✓ explicit query intent remains authoritative");
}

/*
 * 6. Base strategy remains immutable
 */

{
  const query = "angular signals";

  const profile = analyzer.analyze(query);
  const base = selector.select(profile);

  const snapshot = structuredClone(base);

  applyContextToRetrievalStrategy(
    base,
    profile,
    context({
      goals: [
        {
          id: "goal-1",
          description: "understand Angular",
          priority: 1,
        },
      ],
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
    }),
  );

  assert.deepEqual(base, snapshot, "base strategy must remain immutable");

  console.log("✓ base strategy remains immutable");
}

console.log("\n=== ALL CONTEXT-AWARE RETRIEVAL PIPELINE TESTS PASSED ===");
