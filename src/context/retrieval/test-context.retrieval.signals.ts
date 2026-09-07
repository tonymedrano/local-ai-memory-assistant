import { buildContext } from "../model/context.builder.js";
import { buildContextRetrievalSignals } from "./context.retrieval.signals.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("=== Context Retrieval Signals Tests ===");

// -------------------------------------------------------
// 1. Complete context
// -------------------------------------------------------

const context = buildContext({
  query: "Mejorar retrieval de Angular usando Qdrant",

  entities: [
    {
      id: "angular",
      label: "Angular",
      type: "technology",
      confidence: 0.95,
      source: "query",
    },
    {
      id: "qdrant",
      label: "Qdrant",
      type: "technology",
      confidence: 0.95,
      source: "query",
    },
  ],

  topics: ["frontend", "retrieval", "database"],

  goals: [
    {
      id: "mejorar-retrieval",
      description: "mejorar retrieval",
      priority: 0.9,
    },
  ],

  temporal: {
    referenceTime: "2026-08-24T10:00:00.000Z",
    from: "2026-08-23T00:00:00.000Z",
    to: "2026-08-23T23:59:59.999Z",
    isRelative: true,
  },

  constraints: [
    {
      type: "technology",
      value: "Qdrant",
      source: "query",
    },
    {
      type: "restriction",
      value: "MongoDB",
      source: "query",
    },
  ],
});

const signals = buildContextRetrievalSignals(context);

assert(signals.entities.length === 2, "entities should be propagated");

assert(
  signals.entities.includes("Angular"),
  "Angular entity should be propagated",
);

assert(
  signals.entities.includes("Qdrant"),
  "Qdrant entity should be propagated",
);

assert(signals.topics.length === 3, "topics should be propagated");

assert(
  signals.topics.includes("retrieval"),
  "retrieval topic should be propagated",
);

assert(
  signals.goalTerms.includes("mejorar"),
  "goal term mejorar should be propagated",
);

assert(
  signals.goalTerms.includes("retrieval"),
  "goal term retrieval should be propagated",
);

assert(
  signals.temporalFrom === "2026-08-23T00:00:00.000Z",
  "temporal from should be propagated",
);

assert(
  signals.temporalTo === "2026-08-23T23:59:59.999Z",
  "temporal to should be propagated",
);

assert(signals.constraints.length === 2, "constraints should be propagated");

assert(
  signals.constraints.some(
    (constraint) =>
      constraint.type === "technology" && constraint.value === "Qdrant",
  ),
  "technology constraint should be propagated",
);

assert(
  signals.constraints.some(
    (constraint) =>
      constraint.type === "restriction" && constraint.value === "MongoDB",
  ),
  "restriction constraint should be propagated",
);

console.log("✓ complete context mapped");

// -------------------------------------------------------
// 2. Empty context
// -------------------------------------------------------

const emptyContext = buildContext({
  query: "Hola",
});

const emptySignals = buildContextRetrievalSignals(emptyContext);

assert(
  emptySignals.entities.length === 0,
  "empty entities should remain empty",
);

assert(emptySignals.topics.length === 0, "empty topics should remain empty");

assert(
  emptySignals.goalTerms.length === 0,
  "empty goal terms should remain empty",
);

assert(
  emptySignals.temporalFrom === undefined,
  "temporal from should be undefined",
);

assert(
  emptySignals.temporalTo === undefined,
  "temporal to should be undefined",
);

assert(
  emptySignals.constraints.length === 0,
  "empty constraints should remain empty",
);

console.log("✓ empty context handled");

// -------------------------------------------------------
// 3. Multiple goals
// -------------------------------------------------------

const multiGoalContext = buildContext({
  query: "test",

  goals: [
    {
      id: "goal-one",
      description: "mejorar retrieval",
      priority: 0.9,
    },
    {
      id: "goal-two",
      description: "reducir latencia",
      priority: 0.8,
    },
  ],
});

const multiGoalSignals = buildContextRetrievalSignals(multiGoalContext);

assert(
  multiGoalSignals.goalTerms.includes("mejorar"),
  "first goal should contribute terms",
);

assert(
  multiGoalSignals.goalTerms.includes("latencia"),
  "second goal should contribute terms",
);

console.log("✓ multiple goals flattened");

// -------------------------------------------------------
// 4. No mutation
// -------------------------------------------------------

assert(context.topics.length === 3, "context topics should not be mutated");

assert(
  context.constraints.length === 2,
  "context constraints should not be mutated",
);

console.log("✓ source context remains unchanged");

console.log("\n=== ALL CONTEXT RETRIEVAL SIGNALS TESTS PASSED ===");
