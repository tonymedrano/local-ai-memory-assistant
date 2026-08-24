import { buildContext } from "./context.builder.js";
import { normalizeContext } from "./context.normalizer.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log("=== Context Normalizer Tests ===");

// ---------------------------------------------------------
// 1. Query normalization
// ---------------------------------------------------------

const queryContext = buildContext({
  query: "  Angular    TypeScript   ",
});

const normalizedQueryContext = normalizeContext(queryContext);

assert(
  normalizedQueryContext.query === "Angular TypeScript",
  "query should be normalized",
);

console.log("✓ query normalized");

// ---------------------------------------------------------
// 2. Entity normalization
// ---------------------------------------------------------

const entityContext = buildContext({
  query: "Angular",

  entities: [
    {
      id: "  angular  ",
      label: "  Angular   Framework  ",
      type: "  technology  ",
      confidence: 0.95,
      source: "query",
    },
  ],
});

const normalizedEntityContext = normalizeContext(entityContext);

const entity = normalizedEntityContext.entities[0];

assert(entity.id === "angular", "entity id should be trimmed");

assert(
  entity.label === "Angular Framework",
  "entity label should be normalized",
);

assert(entity.type === "technology", "entity type should be normalized");

console.log("✓ entity normalized");

// ---------------------------------------------------------
// 3. Topics normalization
// ---------------------------------------------------------

const topicsContext = buildContext({
  query: "Angular",

  topics: [" Angular ", "Angular", " TypeScript ", "", "   "],
});

const normalizedTopicsContext = normalizeContext(topicsContext);

assert(
  normalizedTopicsContext.topics.length === 2,
  "duplicate and empty topics should be removed",
);

assert(
  normalizedTopicsContext.topics.includes("Angular"),
  "Angular topic should remain",
);

assert(
  normalizedTopicsContext.topics.includes("TypeScript"),
  "TypeScript topic should remain",
);

console.log("✓ topics normalized");

// ---------------------------------------------------------
// 4. Project normalization
// ---------------------------------------------------------

const projectContext = buildContext({
  query: "Angular",
  project: "   memory-service   ",
});

const normalizedProjectContext = normalizeContext(projectContext);

assert(
  normalizedProjectContext.project === "memory-service",
  "project should be normalized",
);

console.log("✓ project normalized");

// ---------------------------------------------------------
// 5. Goal normalization
// ---------------------------------------------------------

const goalContext = buildContext({
  query: "Angular",

  goals: [
    {
      id: "  goal-1  ",
      description: "  Improve    frontend   architecture  ",
      priority: 0.9,
    },
  ],
});

const normalizedGoalContext = normalizeContext(goalContext);

const goal = normalizedGoalContext.goals[0];

assert(goal.id === "goal-1", "goal id should be normalized");

assert(
  goal.description === "Improve frontend architecture",
  "goal description should be normalized",
);

assert(goal.priority === 0.9, "goal priority should be preserved");

console.log("✓ goal normalized");

// ---------------------------------------------------------
// 6. Constraint normalization
// ---------------------------------------------------------

const constraintContext = buildContext({
  query: "Angular",

  constraints: [
    {
      type: "  technology ",
      value: "  TypeScript   ",
      source: "query",
    },
  ],
});

const normalizedConstraintContext = normalizeContext(constraintContext);

const constraint = normalizedConstraintContext.constraints[0];

assert(
  constraint.type === "technology",
  "constraint type should be normalized",
);

assert(
  constraint.value === "TypeScript",
  "constraint value should be normalized",
);

console.log("✓ constraint normalized");

// ---------------------------------------------------------
// 7. Memory reference normalization
// ---------------------------------------------------------

const memoryContext = buildContext({
  query: "Angular",

  memories: [
    {
      id: "  memory-123  ",
      relevance: 0.92,
    },
  ],
});

const normalizedMemoryContext = normalizeContext(memoryContext);

const memory = normalizedMemoryContext.memories[0];

assert(memory.id === "memory-123", "memory id should be normalized");

assert(memory.relevance === 0.92, "memory relevance should be preserved");

console.log("✓ memory reference normalized");

// ---------------------------------------------------------
// 8. Knowledge reference normalization
// ---------------------------------------------------------

const knowledgeContext = buildContext({
  query: "Angular",

  knowledge: [
    {
      id: "  angular  ",
      relevance: 0.88,
    },
  ],
});

const normalizedKnowledgeContext = normalizeContext(knowledgeContext);

const knowledge = normalizedKnowledgeContext.knowledge[0];

assert(knowledge.id === "angular", "knowledge id should be normalized");

assert(knowledge.relevance === 0.88, "knowledge relevance should be preserved");

console.log("✓ knowledge reference normalized");

// ---------------------------------------------------------
// 9. Score normalization
// ---------------------------------------------------------

const scoreContext = buildContext({
  query: "Angular",

  entities: [
    {
      id: "angular",
      label: "Angular",
      confidence: 1.5,
      source: "query",
    },
  ],

  goals: [
    {
      id: "goal-1",
      description: "Test",
      priority: -0.5,
    },
  ],

  memories: [
    {
      id: "memory-1",
      relevance: 2,
    },
  ],

  knowledge: [
    {
      id: "knowledge-1",
      relevance: -1,
    },
  ],
});

const normalizedScoreContext = normalizeContext(scoreContext);

assert(
  normalizedScoreContext.entities[0].confidence === 1,
  "entity confidence should be capped at 1",
);

assert(
  normalizedScoreContext.goals[0].priority === 0,
  "goal priority should be floored at 0",
);

assert(
  normalizedScoreContext.memories[0].relevance === 1,
  "memory relevance should be capped at 1",
);

assert(
  normalizedScoreContext.knowledge[0].relevance === 0,
  "knowledge relevance should be floored at 0",
);

console.log("✓ scores normalized");

// ---------------------------------------------------------
// 10. Temporal normalization
// ---------------------------------------------------------

const temporalContext = buildContext({
  query: "Angular",

  temporal: {
    referenceTime: "  2026-08-24T07:00:00.000Z  ",
    from: "  2026-08-01T00:00:00.000Z  ",
    to: "  2026-08-31T23:59:59.000Z  ",
    isRelative: false,
  },
});

const normalizedTemporalContext = normalizeContext(temporalContext);

assert(
  normalizedTemporalContext.temporal?.referenceTime ===
    "2026-08-24T07:00:00.000Z",
  "referenceTime should be normalized",
);

assert(
  normalizedTemporalContext.temporal?.from === "2026-08-01T00:00:00.000Z",
  "temporal from should be normalized",
);

assert(
  normalizedTemporalContext.temporal?.to === "2026-08-31T23:59:59.000Z",
  "temporal to should be normalized",
);

console.log("✓ temporal context normalized");

// ---------------------------------------------------------
// 11. Original context must not mutate
// ---------------------------------------------------------

const immutableContext = buildContext({
  query: "   Angular    TypeScript   ",

  topics: [" Angular ", "TypeScript"],

  project: "   memory-service   ",
});

const originalQuery = immutableContext.query;

const originalTopics = [...immutableContext.topics];

const originalProject = immutableContext.project;

const normalizedImmutableContext = normalizeContext(immutableContext);

assert(
  immutableContext.query === originalQuery,
  "original query must not be mutated",
);

assert(
  JSON.stringify(immutableContext.topics) === JSON.stringify(originalTopics),
  "original topics must not be mutated",
);

assert(
  immutableContext.project === originalProject,
  "original project must not be mutated",
);

assert(
  normalizedImmutableContext !== immutableContext,
  "normalization should return a new context object",
);

console.log("✓ original context is not mutated");

// ---------------------------------------------------------
// 12. Normalization preserves root identity
// ---------------------------------------------------------

const identityContext = buildContext({
  query: "Angular",
});

const normalizedIdentityContext = normalizeContext(identityContext);

assert(
  normalizedIdentityContext.id === identityContext.id,
  "context id should be preserved",
);

assert(
  normalizedIdentityContext.createdAt === identityContext.createdAt,
  "createdAt should be preserved",
);

console.log("✓ root identity preserved");

// ---------------------------------------------------------
// Final result
// ---------------------------------------------------------

console.log("");
console.log("=== ALL CONTEXT NORMALIZATION TESTS PASSED ===");
