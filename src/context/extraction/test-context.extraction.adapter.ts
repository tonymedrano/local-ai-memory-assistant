import { buildContextFromExtraction } from "./context.extraction.adapter.js";
import type { ContextExtractionResult } from "./context.extraction.types.js";
import { validateContext } from "../model/context.validator.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const extraction: ContextExtractionResult = {
  entities: [
    {
      id: "qdrant",
      label: "Qdrant",
      type: "technology",
      confidence: 0.95,
      source: "query",
    },
  ],

  topics: ["database", "retrieval"],

  goals: [
    {
      id: "improve-retrieval",
      description: "Improve retrieval",
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
  ],
};

const context = buildContextFromExtraction(
  "Mejora el retrieval usando Qdrant",
  extraction,
);

assert(
  context.query === "Mejora el retrieval usando Qdrant",
  "query should be preserved",
);

assert(
  context.entities.length === 1,
  "entities should be mapped",
);

assert(
  context.entities[0].label === "Qdrant",
  "entity label should be preserved",
);

assert(
  context.topics.length === 2,
  "topics should be mapped",
);

assert(
  context.goals.length === 1,
  "goals should be mapped",
);

assert(
  context.goals[0].description === "Improve retrieval",
  "goal should be preserved",
);

assert(
  context.temporal?.from === "2026-08-23T00:00:00.000Z",
  "temporal from should be preserved",
);

assert(
  context.constraints.length === 1,
  "constraints should be mapped",
);

assert(
  context.constraints[0].type === "technology",
  "constraint type should be preserved",
);

assert(
  context.memories.length === 0,
  "memories should remain empty",
);

assert(
  context.knowledge.length === 0,
  "knowledge should remain empty",
);

assert(
  context.confidence === 1,
  "initial context confidence should be 1",
);

const validation = validateContext(context);

assert(
  validation.valid,
  `built context should be valid: ${validation.errors.join(", ")}`,
);

console.log("✓ query mapped");
console.log("✓ entities mapped");
console.log("✓ topics mapped");
console.log("✓ goals mapped");
console.log("✓ temporal mapped");
console.log("✓ constraints mapped");
console.log("✓ memories remain empty");
console.log("✓ knowledge remains empty");
console.log("✓ context normalized");
console.log("✓ context validated");

console.log(
  "\n=== ALL CONTEXT EXTRACTION ADAPTER TESTS PASSED ===",
);
