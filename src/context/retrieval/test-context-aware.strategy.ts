import { ContextAwareRetrievalStrategy } from "./context-aware.strategy.js";
import type { ContextRetrievalSignals } from "./context.retrieval.signals.js";
import type { RetrievalStrategy } from "../../retrieval/strategy/retrieval.strategy.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const modifier = new ContextAwareRetrievalStrategy();

const baseStrategy: RetrievalStrategy = {
  mode: "hybrid",
  vectorWeight: 0.6,
  keywordWeight: 0.4,
  graphWeight: 0,
  graphEvidenceWeight: 0,
  topK: 10,
  expandQuery: false,
  rerank: true,
  temporalBoost: 0,
};

console.log("=== Context-Aware Retrieval Strategy Tests ===");

/*
 * -------------------------------------------------------
 * Empty context
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: [],
    topics: [],
    goalTerms: [],
    constraints: [],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    JSON.stringify(result) === JSON.stringify(baseStrategy),
    "empty context should not modify strategy",
  );

  console.log("✓ empty context preserves strategy");
}

/*
 * -------------------------------------------------------
 * Entities
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: ["Angular", "TypeScript"],
    topics: [],
    goalTerms: [],
    constraints: [],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    result.graphEvidenceWeight >= 0.35,
    "multiple entities should reinforce graph evidence",
  );

  console.log("✓ multiple entities reinforce graph evidence");
}

/*
 * -------------------------------------------------------
 * Topics
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: [],
    topics: ["retrieval", "knowledge"],
    goalTerms: [],
    constraints: [],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    result.vectorWeight >= 0.4,
    "topics should reinforce vector retrieval",
  );

  console.log("✓ topics reinforce vector retrieval");
}

/*
 * -------------------------------------------------------
 * Goals
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: [],
    topics: [],
    goalTerms: ["implementar", "sistema", "memoria"],
    constraints: [],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(result.topK === 15, "goals should increase candidate budget");

  console.log("✓ goals increase candidate budget");
}

/*
 * -------------------------------------------------------
 * Temporal
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: [],
    topics: [],
    goalTerms: [],
    temporalFrom: "2026-08-23T00:00:00.000Z",
    temporalTo: "2026-08-23T23:59:59.999Z",
    constraints: [],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    result.temporalBoost >= 0.7,
    "temporal context should reinforce temporal boost",
  );

  console.log("✓ temporal context reinforces temporal retrieval");
}

/*
 * -------------------------------------------------------
 * Constraints
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: [],
    topics: [],
    goalTerms: [],
    constraints: [
      {
        type: "technology",
        value: "Qdrant",
      },
    ],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    result.keywordWeight >= 0.2,
    "constraints should reinforce keyword retrieval",
  );

  console.log("✓ constraints reinforce keyword retrieval");
}

/*
 * -------------------------------------------------------
 * Combined context
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: ["Angular", "TypeScript"],
    topics: ["frontend", "architecture"],
    goalTerms: ["mejorar", "arquitectura"],
    temporalFrom: "2026-08-23T00:00:00.000Z",
    temporalTo: "2026-08-23T23:59:59.999Z",
    constraints: [
      {
        type: "compatibility",
        value: "API actual",
      },
    ],
  };

  const result = modifier.apply(baseStrategy, signals);

  assert(
    result.graphEvidenceWeight >= 0.35,
    "combined context should preserve graph evidence",
  );

  assert(
    result.vectorWeight >= 0.4,
    "combined context should preserve vector weight",
  );

  assert(
    result.keywordWeight >= 0.2,
    "combined context should preserve keyword weight",
  );

  assert(
    result.topK === 15,
    "combined context should increase candidate budget",
  );

  assert(
    result.temporalBoost >= 0.7,
    "combined context should preserve temporal boost",
  );

  console.log("✓ combined context produces cumulative strategy hints");
}

/*
 * -------------------------------------------------------
 * No mutation
 * -------------------------------------------------------
 */

{
  const signals: ContextRetrievalSignals = {
    entities: ["Angular", "TypeScript"],
    topics: ["frontend"],
    goalTerms: ["mejorar"],
    constraints: [],
  };

  const original = JSON.stringify(baseStrategy);

  modifier.apply(baseStrategy, signals);

  assert(
    JSON.stringify(baseStrategy) === original,
    "base strategy must not be mutated",
  );

  console.log("✓ base strategy remains immutable");
}

console.log("\n=== ALL CONTEXT-AWARE RETRIEVAL STRATEGY TESTS PASSED ===");
