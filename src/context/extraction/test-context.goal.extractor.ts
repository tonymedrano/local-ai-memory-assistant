import { ContextGoalExtractor } from "./context.goal.extractor.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const extractor = new ContextGoalExtractor();

console.log("=== Context Goal Extractor Tests ===");

// ---------------------------------------------------------
// 1. Explicit quiero
// ---------------------------------------------------------

const quiero = extractor.extract("Quiero mejorar el reranking");

assert(quiero.length === 1, "explicit quiero should produce a goal");

assert(
  quiero[0].description === "mejorar el reranking",
  "goal description should be extracted",
);

assert(quiero[0].priority === 0.95, "explicit goal should have high priority");

console.log("✓ explicit goal");

// ---------------------------------------------------------
// 2. Necesitamos
// ---------------------------------------------------------

const necesitamos = extractor.extract(
  "Necesitamos implementar el nuevo contexto",
);

assert(necesitamos.length === 1, "necesitamos should produce a goal");

assert(
  necesitamos[0].description === "implementar el nuevo contexto",
  "goal description should be preserved",
);

console.log("✓ necesitamos goal");

// ---------------------------------------------------------
// 3. Para
// ---------------------------------------------------------

const para = extractor.extract(
  "Optimizar la recuperación para mejorar la precisión",
);

assert(
  para.length === 1,
  "goal should be detected from improvement expression",
);

assert(
  para[0].description === "mejorar la precisión",
  "goal should capture the intended result",
);

console.log("✓ purpose goal");

// ---------------------------------------------------------
// 4. Improve
// ---------------------------------------------------------

const improve = extractor.extract("Improve retrieval quality");

assert(improve.length === 1, "English improve should produce a goal");

assert(
  improve[0].description === "retrieval quality",
  "English goal should be extracted",
);

console.log("✓ English goal");

// ---------------------------------------------------------
// 5. Implement
// ---------------------------------------------------------

const implement = extractor.extract("Implement contextual reasoning");

assert(implement.length === 1, "implement should produce a goal");

assert(
  implement[0].description === "contextual reasoning",
  "implementation goal should be extracted",
);

console.log("✓ implementation goal");

// ---------------------------------------------------------
// 6. Resolve
// ---------------------------------------------------------

const resolve = extractor.extract("Resolver el problema de identidad");

assert(resolve.length === 1, "resolver should produce a goal");

assert(
  resolve[0].description === "el problema de identidad",
  "resolution goal should be extracted",
);

console.log("✓ resolution goal");

// ---------------------------------------------------------
// 7. Goal id
// ---------------------------------------------------------

const goal = extractor.extract("Quiero mejorar la recuperación");

assert(
  goal[0].id === "mejorar-la-recuperacion",
  "goal id should be normalized",
);

console.log("✓ goal id normalization");

// ---------------------------------------------------------
// 8. Empty query
// ---------------------------------------------------------

const empty = extractor.extract("");

assert(empty.length === 0, "empty query should produce no goals");

console.log("✓ empty query");

// ---------------------------------------------------------
// 9. No goal invented
// ---------------------------------------------------------

const noGoal = extractor.extract("Angular TypeScript");

assert(noGoal.length === 0, "descriptive query should not invent a goal");

console.log("✓ no goal invented");

// ---------------------------------------------------------
// 10. Whitespace
// ---------------------------------------------------------

const whitespace = extractor.extract("   ");

assert(whitespace.length === 0, "whitespace query should produce no goals");

console.log("✓ whitespace query");

// ---------------------------------------------------------
// Final
// ---------------------------------------------------------

console.log("");

console.log("=== ALL CONTEXT GOAL EXTRACTION TESTS PASSED ===");
