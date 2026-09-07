import { ContextEntityExtractor } from "./context.entity.extractor.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const extractor = new ContextEntityExtractor();

console.log("=== Context Entity Extractor Tests ===");

// ---------------------------------------------------------
// 1. Single entity
// ---------------------------------------------------------

const angular = extractor.extract("Angular");

assert(angular.length === 1, "Angular should produce one entity");

assert(angular[0].id === "angular", "Angular id should be canonicalized");

assert(angular[0].label === "Angular", "Angular label should be preserved");

assert(
  angular[0].type === "technology",
  "Angular should initially be classified as technology",
);

assert(
  angular[0].confidence === 0.95,
  "query entities should have high confidence",
);

assert(angular[0].source === "query", "entity source should be query");

console.log("✓ single entity");

// ---------------------------------------------------------
// 2. Multiple entities
// ---------------------------------------------------------

const multiple = extractor.extract(
  "¿qué relación existe entre Angular y TypeScript?",
);

assert(multiple.length === 2, "Angular and TypeScript should both be detected");

assert(
  multiple.some((entity) => entity.id === "angular"),
  "Angular should be detected",
);

assert(
  multiple.some((entity) => entity.id === "typescript"),
  "TypeScript should be detected",
);

console.log("✓ multiple entities");

// ---------------------------------------------------------
// 3. Entity label preservation
// ---------------------------------------------------------

const retrievalPipeline = extractor.extract(
  "cómo funciona el Hybrid Retrieval",
);

assert(retrievalPipeline.length === 1, "Hybrid Retrieval should be detected");

assert(
  retrievalPipeline[0].label === "Hybrid Retrieval",
  "original entity label should be preserved",
);

assert(
  retrievalPipeline[0].id === "hybrid-retrieval",
  "entity id should be normalized",
);

console.log("✓ entity label preservation");

// ---------------------------------------------------------
// 4. Case insensitive detection
// ---------------------------------------------------------

const lowercase = extractor.extract("angular typescript docker");

assert(lowercase.length === 3, "entity extraction should be case insensitive");

console.log("✓ case insensitive extraction");

// ---------------------------------------------------------
// 5. Unknown entities
// ---------------------------------------------------------

const unknown = extractor.extract("React Vue Svelte");

assert(unknown.length === 0, "unknown entities should not be invented");

console.log("✓ unknown entities ignored");

// ---------------------------------------------------------
// 6. Empty query
// ---------------------------------------------------------

const empty = extractor.extract("");

assert(empty.length === 0, "empty query should produce no entities");

console.log("✓ empty query");

// ---------------------------------------------------------
// 7. Duplicate mention
// ---------------------------------------------------------

const duplicated = extractor.extract("Angular Angular Angular");

assert(
  duplicated.length === 1,
  "duplicate entity mentions should produce one entity",
);

console.log("✓ duplicate entity deduplication");

// ---------------------------------------------------------
// 8. Temporal query does not create fake entities
// ---------------------------------------------------------

const temporal = extractor.extract("¿qué decidimos sobre LTR ayer?");

assert(temporal.length === 1, "LTR should be detected");

assert(temporal[0].id === "ltr", "LTR should be normalized correctly");

console.log("✓ temporal query entity extraction");

// ---------------------------------------------------------
// Final
// ---------------------------------------------------------

console.log("");

console.log("=== ALL CONTEXT ENTITY EXTRACTION TESTS PASSED ===");
