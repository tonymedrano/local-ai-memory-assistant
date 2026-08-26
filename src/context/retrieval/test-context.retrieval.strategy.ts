import { buildContextRetrievalStrategyHints } from "./context.retrieval.strategy.js";
import type { ContextRetrievalSignals } from "./context.retrieval.signals.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("=== Context Retrieval Strategy Tests ===");

// -------------------------------------------------------
// 1. Complete contextual signals
// -------------------------------------------------------

const completeSignals: ContextRetrievalSignals = {
  entities: ["Qdrant", "MongoDB"],
  topics: ["database", "knowledge"],
  goalTerms: ["implementa", "el", "sistema"],
  temporalFrom: "2026-08-23T00:00:00.000Z",
  temporalTo: "2026-08-23T23:59:59.999Z",
  constraints: [
    {
      type: "restriction",
      value: "MongoDB",
    },
  ],
};

const complete = buildContextRetrievalStrategyHints(completeSignals);

assert(
  complete.preferredMode === "knowledge",
  "knowledge context should prefer knowledge mode",
);

assert(complete.semanticBoost === 0.1, "goals should produce semantic boost");

assert(
  complete.keywordBoost === 0.1,
  "constraints should produce keyword boost",
);

assert(
  complete.graphBoost === 0.1,
  "multiple entities should produce graph boost",
);

assert(
  complete.temporalBoost === 0.1,
  "temporal context should produce temporal boost",
);

assert(complete.hasGoals, "goals should be detected");
assert(complete.hasTopics, "topics should be detected");
assert(complete.hasConstraints, "constraints should be detected");
assert(complete.hasTemporalContext, "temporal context should be detected");

console.log("✓ complete contextual signals mapped");

// -------------------------------------------------------
// 2. Empty context
// -------------------------------------------------------

const emptySignals: ContextRetrievalSignals = {
  entities: [],
  topics: [],
  goalTerms: [],
  constraints: [],
};

const empty = buildContextRetrievalStrategyHints(emptySignals);

assert(
  empty.preferredMode === undefined,
  "empty context should not prefer a retrieval mode",
);

assert(
  empty.semanticBoost === 0,
  "empty context should have no semantic boost",
);

assert(empty.keywordBoost === 0, "empty context should have no keyword boost");

assert(empty.graphBoost === 0, "empty context should have no graph boost");

assert(
  empty.temporalBoost === 0,
  "empty context should have no temporal boost",
);

console.log("✓ empty context handled");

// -------------------------------------------------------
// 3. Temporal context
// -------------------------------------------------------

const temporalSignals: ContextRetrievalSignals = {
  entities: [],
  topics: [],
  goalTerms: [],
  temporalFrom: "2026-08-23T00:00:00.000Z",
  temporalTo: "2026-08-23T23:59:59.999Z",
  constraints: [],
};

const temporal = buildContextRetrievalStrategyHints(temporalSignals);

assert(temporal.hasTemporalContext, "temporal signals should be detected");

assert(
  temporal.temporalBoost === 0.1,
  "temporal context should produce temporal boost",
);

console.log("✓ temporal context mapped");

// -------------------------------------------------------
// 4. Constraints without goals
// -------------------------------------------------------

const constraintSignals: ContextRetrievalSignals = {
  entities: [],
  topics: [],
  goalTerms: [],
  constraints: [
    {
      type: "restriction",
      value: "MongoDB",
    },
  ],
};

const constraints = buildContextRetrievalStrategyHints(constraintSignals);

assert(constraints.hasConstraints, "constraints should be detected");

assert(
  constraints.keywordBoost === 0.1,
  "constraints should produce keyword boost",
);

assert(
  constraints.semanticBoost === 0,
  "constraints alone should not produce semantic boost",
);

console.log("✓ constraints mapped");

// -------------------------------------------------------
// 5. Context must remain non-authoritative
// -------------------------------------------------------

const genericKnowledgeSignals: ContextRetrievalSignals = {
  entities: [],
  topics: ["knowledge"],
  goalTerms: [],
  constraints: [],
};

const hints = buildContextRetrievalStrategyHints(genericKnowledgeSignals);

assert(
  hints.preferredMode === "knowledge",
  "knowledge topic should provide a strategy hint",
);

console.log("✓ context produces hints without losing semantics");

console.log("\n=== ALL CONTEXT RETRIEVAL STRATEGY TESTS PASSED ===");
