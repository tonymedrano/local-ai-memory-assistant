import type { MemorySearchResult } from "../../memory/memory.repository.js";

import { adaptMemoryResultsToContext } from "./context.adapter.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function createResult(
  id: string,
  score: number,
  text = "Test memory",
): MemorySearchResult {
  return {
    id,
    score,
    payload: {
      id,
      text,
      importance: 0.5,
      confidence: 0.8,
    },
  };
}

console.log("=== Context Adapter Tests ===");

// ---------------------------------------------------------
// 1. Empty results
// ---------------------------------------------------------

const emptyContext = adaptMemoryResultsToContext("Angular", []);

assert(emptyContext.query === "Angular", "query should be preserved");

assert(
  emptyContext.memories.length === 0,
  "empty results should produce no memory references",
);

assert(
  emptyContext.confidence === 0,
  "empty results should produce confidence 0",
);

console.log("✓ empty results");

// ---------------------------------------------------------
// 2. Single result
// ---------------------------------------------------------

const singleResult = createResult("memory-1", 0.92);

const singleContext = adaptMemoryResultsToContext("Angular", [singleResult]);

assert(
  singleContext.memories.length === 1,
  "single result should produce one memory reference",
);

assert(
  singleContext.memories[0].id === "memory-1",
  "memory id should be preserved",
);

assert(
  singleContext.memories[0].relevance === 0.92,
  "memory relevance should use retrieval score",
);

assert(
  singleContext.confidence === 0.92,
  "single result confidence should equal its relevance",
);

console.log("✓ single result");

// ---------------------------------------------------------
// 3. Multiple results
// ---------------------------------------------------------

const multipleResults = [
  createResult("memory-1", 0.9),
  createResult("memory-2", 0.8),
  createResult("memory-3", 0.7),
];

const multipleContext = adaptMemoryResultsToContext(
  "Angular TypeScript",
  multipleResults,
);

assert(
  multipleContext.memories.length === 3,
  "all results should become memory references",
);

assert(
  multipleContext.memories[0].id === "memory-1",
  "first memory id should be preserved",
);

assert(
  multipleContext.memories[1].id === "memory-2",
  "second memory id should be preserved",
);

assert(
  multipleContext.memories[2].id === "memory-3",
  "third memory id should be preserved",
);

assert(
  Math.abs(multipleContext.confidence - 0.8) < 0.000001,
  "confidence should be the average relevance",
);

console.log("✓ multiple results");

// ---------------------------------------------------------
// 4. Query normalization
// ---------------------------------------------------------

const normalizedQueryContext = adaptMemoryResultsToContext(
  "  Angular    TypeScript  ",
  [],
);

assert(
  normalizedQueryContext.query === "Angular TypeScript",
  "query should be normalized",
);

console.log("✓ query normalized");

// ---------------------------------------------------------
// 5. Score > 1
// ---------------------------------------------------------

const highScoreContext = adaptMemoryResultsToContext("Angular", [
  createResult("memory-high", 2),
]);

assert(
  highScoreContext.memories[0].relevance === 1,
  "score > 1 should be capped at 1",
);

assert(highScoreContext.confidence === 1, "confidence should be capped at 1");

console.log("✓ score > 1 normalized");

// ---------------------------------------------------------
// 6. Score < 0
// ---------------------------------------------------------

const negativeScoreContext = adaptMemoryResultsToContext("Angular", [
  createResult("memory-negative", -1),
]);

assert(
  negativeScoreContext.memories[0].relevance === 0,
  "negative score should be normalized to 0",
);

assert(
  negativeScoreContext.confidence === 0,
  "negative score should produce confidence 0",
);

console.log("✓ negative score normalized");

// ---------------------------------------------------------
// 7. Invalid score
// ---------------------------------------------------------

const invalidScoreContext = adaptMemoryResultsToContext("Angular", [
  createResult("memory-invalid", Number.NaN),
]);

assert(
  invalidScoreContext.memories[0].relevance === 0,
  "invalid score should become 0",
);

assert(
  invalidScoreContext.confidence === 0,
  "invalid score should produce confidence 0",
);

console.log("✓ invalid score normalized");

// ---------------------------------------------------------
// 8. Numeric memory ID
// ---------------------------------------------------------

const numericIdResult: MemorySearchResult = {
  id: 123,
  score: 0.75,
  payload: {
    text: "Test memory",
  },
};

const numericIdContext = adaptMemoryResultsToContext("Angular", [
  numericIdResult,
]);

assert(
  numericIdContext.memories[0].id === "123",
  "numeric memory id should be converted to string",
);

console.log("✓ numeric memory id normalized");

// ---------------------------------------------------------
// 9. Original results must not mutate
// ---------------------------------------------------------

const originalResults = [createResult("memory-original", 0.85)];

const originalId = originalResults[0].id;

const originalScore = originalResults[0].score;

adaptMemoryResultsToContext("Angular", originalResults);

assert(
  originalResults[0].id === originalId,
  "original result id must not change",
);

assert(
  originalResults[0].score === originalScore,
  "original result score must not change",
);

console.log("✓ original results are not mutated");

// ---------------------------------------------------------
// 10. Context validation
// ---------------------------------------------------------

const validContext = adaptMemoryResultsToContext("Angular", [
  createResult("memory-valid", 0.95),
]);

assert(validContext.id.length > 0, "adapted context should have an id");

assert(
  validContext.createdAt.length > 0,
  "adapted context should have createdAt",
);

assert(
  validContext.memories.length === 1,
  "adapted context should contain memory reference",
);

console.log("✓ adapted context is valid");

// ---------------------------------------------------------
// Final result
// ---------------------------------------------------------

console.log("");
console.log("=== ALL CONTEXT ADAPTER TESTS PASSED ===");
