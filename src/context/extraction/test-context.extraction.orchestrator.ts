import { ContextExtractionOrchestrator } from "./context.extraction.orchestrator.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("=== Context Extraction Orchestrator Tests ===");

const orchestrator = new ContextExtractionOrchestrator();

const referenceTime = new Date("2026-08-24T12:00:00.000Z");

/*
 * 1. Empty query
 */

const empty = orchestrator.extract("", referenceTime);

assert(empty.entities.length === 0, "empty query entities");
assert(empty.topics.length === 0, "empty query topics");
assert(empty.goals.length === 0, "empty query goals");
assert(empty.temporal === undefined, "empty query temporal");
assert(empty.constraints.length === 0, "empty query constraints");

console.log("✓ empty query");

/*
 * 2. Entities
 */

const entityContext = orchestrator.extract(
  "Angular TypeScript",
  referenceTime,
);

assert(
  entityContext.entities.length === 2,
  "multiple entities should be extracted",
);

assert(
  entityContext.entities.some(
    (entity) => entity.label === "Angular",
  ),
  "Angular entity should be present",
);

assert(
  entityContext.entities.some(
    (entity) => entity.label === "TypeScript",
  ),
  "TypeScript entity should be present",
);

console.log("✓ entities extracted");

/*
 * 3. Topics
 */

assert(
  entityContext.topics.includes("frontend"),
  "frontend topic should be extracted",
);

console.log("✓ topics extracted");

/*
 * 4. Goal
 */

const goalContext = orchestrator.extract(
  "Necesitamos mejorar la arquitectura del retrieval pipeline",
  referenceTime,
);

assert(
  goalContext.goals.length === 1,
  "goal should be extracted",
);

assert(
  goalContext.goals[0].description ===
    "mejorar la arquitectura del retrieval pipeline",
  "goal description should be preserved",
);

console.log("✓ goals extracted");

/*
 * 5. Temporal context
 */

const temporalContext = orchestrator.extract(
  "¿Qué decidimos ayer sobre LTR?",
  referenceTime,
);

assert(
  temporalContext.temporal !== undefined,
  "temporal context should be extracted",
);

assert(
  temporalContext.temporal?.from ===
    "2026-08-23T00:00:00.000Z",
  "temporal from should be August 23",
);

assert(
  temporalContext.temporal?.to ===
    "2026-08-23T23:59:59.999Z",
  "temporal to should be August 23",
);

console.log("✓ temporal context extracted");

/*
 * 6. Constraints
 */

const constraintContext = orchestrator.extract(
  "Implementa el sistema usando Qdrant sin MongoDB",
  referenceTime,
);

assert(
  constraintContext.constraints.some(
    (constraint) =>
      constraint.type === "technology" &&
      constraint.value === "Qdrant",
  ),
  "technology constraint should be extracted",
);

assert(
  constraintContext.constraints.some(
    (constraint) =>
      constraint.type === "restriction" &&
      constraint.value === "MongoDB",
  ),
  "restriction constraint should be extracted",
);

console.log("✓ constraints extracted");

/*
 * 7. Source preservation
 */

assert(
  constraintContext.constraints.every(
    (constraint) => constraint.source === "query",
  ),
  "constraint source should be query",
);

assert(
  temporalContext.entities.every(
    (entity) => entity.source === "query",
  ),
  "entity source should be query",
);

console.log("✓ sources preserved");

/*
 * 8. Combined extraction
 */

const combined = orchestrator.extract(
  "¿Cómo mejorar Angular usando TypeScript sin cambiar la API actual y qué decidimos ayer?",
  referenceTime,
);

assert(
  combined.entities.length >= 2,
  "combined query should extract entities",
);

assert(
  combined.topics.includes("frontend"),
  "combined query should extract frontend topic",
);

assert(
  combined.goals.length === 1,
  "combined query should extract goal",
);

assert(
  combined.temporal !== undefined,
  "combined query should extract temporal context",
);

assert(
  combined.constraints.length >= 1,
  "combined query should extract constraints",
);

console.log("✓ combined extraction");

/*
 * 9. Deterministic temporal reference
 */

const first = orchestrator.extract(
  "¿Qué pasó ayer?",
  referenceTime,
);

const second = orchestrator.extract(
  "¿Qué pasó ayer?",
  referenceTime,
);

assert(
  JSON.stringify(first.temporal) ===
    JSON.stringify(second.temporal),
  "same reference time should produce same temporal result",
);

console.log("✓ deterministic temporal extraction");

console.log(
  "\n=== ALL CONTEXT EXTRACTION ORCHESTRATOR TESTS PASSED ===",
);
