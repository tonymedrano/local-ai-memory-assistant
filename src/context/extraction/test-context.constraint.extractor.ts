import { ContextConstraintExtractor } from "./context.constraint.extractor.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

const extractor = new ContextConstraintExtractor();

console.log("=== Context Constraint Extractor Tests ===");

// 1. Restriction

const restriction = extractor.extract(
  "Mejora el reranking sin modificar el pipeline",
);

assert(restriction.length === 1, "restriction should be detected");

assert(
  restriction[0].type === "restriction",
  "constraint type should be restriction",
);

assert(
  restriction[0].value === "modificar el pipeline",
  "restriction value should be extracted",
);

assert(restriction[0].source === "query", "source should default to query");

console.log("✓ restriction");

// 2. Scope

const scope = extractor.extract("Implementa esto solo para memory-service");

assert(scope.length === 1, "scope should be detected");

assert(scope[0].type === "scope", "constraint type should be scope");

assert(scope[0].value === "memory-service", "scope value should be extracted");

console.log("✓ scope");

// 3. Limit

const limit = extractor.extract("Devuelve máximo 5 resultados");

assert(limit.length === 1, "limit should be detected");

assert(limit[0].type === "limit", "constraint type should be limit");

assert(limit[0].value === "5 resultados", "limit value should be extracted");

console.log("✓ limit");

// 4. Compatibility

const compatibility = extractor.extract(
  "Mantén compatibilidad con la API actual",
);

assert(compatibility.length === 1, "compatibility should be detected");

assert(
  compatibility[0].type === "compatibility",
  "constraint type should be compatibility",
);

assert(
  compatibility[0].value === "la API actual",
  "compatibility value should be extracted",
);

console.log("✓ compatibility");

// 5. Technology

const technology = extractor.extract("Implementa el sistema usando Qdrant");

assert(technology.length === 1, "technology requirement should be detected");

assert(
  technology[0].type === "technology",
  "constraint type should be technology",
);

assert(
  technology[0].value === "Qdrant",
  "technology value should be extracted",
);

console.log("✓ technology");

// 6. English

const english = extractor.extract(
  "Improve retrieval without changing the pipeline",
);

assert(english.length === 1, "English restriction should be detected");

assert(
  english[0].type === "restriction",
  "English restriction type should be correct",
);

console.log("✓ English restriction");

// 7. Multiple constraints

const multiple = extractor.extract(
  "Implementa el sistema usando Qdrant sin modificar la API",
);

assert(multiple.length === 2, "multiple constraints should be detected");

assert(
  multiple.some((item) => item.type === "technology"),
  "technology constraint should exist",
);

assert(
  multiple.some((item) => item.type === "restriction"),
  "restriction constraint should exist",
);

console.log("✓ multiple constraints");

// 8. Custom source

const memorySource = extractor.extract("sin modificar el pipeline", "memory");

assert(
  memorySource[0].source === "memory",
  "custom source should be preserved",
);

console.log("✓ source preservation");

// 9. Empty

const empty = extractor.extract("");

assert(empty.length === 0, "empty query should produce no constraints");

console.log("✓ empty query");

// 10. No invented constraints

const none = extractor.extract("Angular TypeScript");

assert(none.length === 0, "descriptive query should not invent constraints");

console.log("✓ no constraints invented");

// 11. Duplicate removal

const duplicate = extractor.extract("usa Qdrant y usa Qdrant");

assert(duplicate.length === 1, "duplicate constraints should be removed");

console.log("✓ duplicate constraints removed");

console.log("");

console.log("=== ALL CONTEXT CONSTRAINT EXTRACTION TESTS PASSED ===");
