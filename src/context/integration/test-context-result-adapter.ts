import type { ContextResult } from "../context.types.js";

import { adaptContextResult } from "./context-result.adapter.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("=== Context Result Adapter Tests ===");

// ---------------------------------------------------------
// 1. Empty context result
// ---------------------------------------------------------

const emptyResult: ContextResult = {
  memories: [],
  knowledge: [],
  inference: [],
  explanations: [],
};

const emptyContext = adaptContextResult("Angular", emptyResult);

assert(emptyContext.query === "Angular", "query should be preserved");

assert(
  emptyContext.memories.length === 0,
  "empty memories should remain empty",
);

assert(
  emptyContext.knowledge.length === 0,
  "empty knowledge should remain empty",
);

console.log("✓ empty ContextResult");

// ---------------------------------------------------------
// 2. Memories
// ---------------------------------------------------------

const memoryResult: ContextResult = {
  memories: [
    {
      score: 0.91,
      item: {
        id: "memory-1",
        text: "Angular uses TypeScript",
      },
    },
    {
      score: 0.82,
      item: {
        id: "memory-2",
        text: "The project uses Qdrant",
      },
    },
  ],

  knowledge: [],

  inference: [],

  explanations: [],
};

const memoryContext = adaptContextResult("Angular TypeScript", memoryResult);

assert(
  memoryContext.memories.length === 2,
  "memory references should be created",
);

assert(
  memoryContext.memories[0].id === "memory-1",
  "first memory id should be preserved",
);

assert(
  memoryContext.memories[0].relevance === 0.91,
  "memory score should become relevance",
);

assert(
  memoryContext.memories[1].id === "memory-2",
  "second memory id should be preserved",
);

console.log("✓ memories adapted");

// ---------------------------------------------------------
// 3. Knowledge
// ---------------------------------------------------------

const knowledgeResult: ContextResult = {
  memories: [],

  knowledge: [
    {
      score: 0.95,
      item: {
        id: "angular",
        type: "technology",
        subject: "Angular",
        content: "Frontend framework",
        relations: [],
        confidence: 0.95,
        createdAt: new Date(),
      },
    },
  ],

  inference: [],

  explanations: [],
};

const knowledgeContext = adaptContextResult("Angular", knowledgeResult);

assert(
  knowledgeContext.knowledge.length === 1,
  "knowledge reference should be created",
);

assert(
  knowledgeContext.knowledge[0].id === "angular",
  "knowledge id should be preserved",
);

assert(
  knowledgeContext.knowledge[0].relevance === 0.95,
  "knowledge score should become relevance",
);

console.log("✓ knowledge adapted");

// ---------------------------------------------------------
// 4. Knowledge without id
// ---------------------------------------------------------

const knowledgeWithoutId: ContextResult = {
  memories: [],

  knowledge: [
    {
      score: 0.8,
      item: {
        type: "technology",
        subject: "TypeScript",
        content: "Programming language",
        relations: [],
        confidence: 0.9,
        createdAt: new Date(),
      },
    },
  ],

  inference: [],

  explanations: [],
};

const fallbackContext = adaptContextResult("TypeScript", knowledgeWithoutId);

assert(
  fallbackContext.knowledge[0].id === "TypeScript",
  "subject should be used when knowledge id is missing",
);

console.log("✓ knowledge id fallback");

// ---------------------------------------------------------
// 5. Inference is not incorrectly mapped
// ---------------------------------------------------------

const inferenceResult: ContextResult = {
  memories: [],

  knowledge: [],

  inference: [
    {
      score: 0.94,
      item: {
        subject: "Angular",
        subjectLabel: "Angular",
        relation: "uses",
        object: "typescript",
        objectLabel: "TypeScript",
        confidence: 0.94,
        source: ["rule-angular-typescript"],
        createdAt:
          "2026-08-24T07:00:00.000Z",
      },
    },
  ],

  explanations: [],
};

const inferenceContext = adaptContextResult("Angular", inferenceResult);

assert(
  inferenceContext.knowledge.length === 0,
  "inference must not be mapped as knowledge",
);

assert(
  inferenceContext.memories.length === 0,
  "inference must not be mapped as memory",
);

console.log("✓ inference remains outside ContextModel");

// ---------------------------------------------------------
// 6. Scores are normalized
// ---------------------------------------------------------

const scoreResult: ContextResult = {
  memories: [
    {
      score: 1.5,
      item: {
        id: "high",
        text: "High score",
      },
    },
    {
      score: -0.5,
      item: {
        id: "low",
        text: "Low score",
      },
    },
  ],

  knowledge: [],

  inference: [],

  explanations: [],
};

const scoreContext = adaptContextResult("Angular", scoreResult);

assert(
  scoreContext.memories[0].relevance === 1,
  "score above 1 should be capped",
);

assert(
  scoreContext.memories[1].relevance === 0,
  "negative score should be floored",
);

console.log("✓ scores normalized");

// ---------------------------------------------------------
// 7. Query normalization
// ---------------------------------------------------------

const queryContext = adaptContextResult(
  "  Angular    TypeScript  ",
  emptyResult,
);

assert(
  queryContext.query === "Angular TypeScript",
  "query should be normalized",
);

console.log("✓ query normalized");

// ---------------------------------------------------------
// Final
// ---------------------------------------------------------

console.log("");

console.log("=== ALL CONTEXT RESULT ADAPTER TESTS PASSED ===");
