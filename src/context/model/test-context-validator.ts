import { buildContext } from "./context.builder.js";
import {
  validateContext,
  type ContextValidationResult,
} from "./context.validator.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function expectValid(
  result: ContextValidationResult,
  description: string,
): void {
  assert(result.valid, `${description} should be valid`);
  assert(
    result.errors.length === 0,
    `${description} should have no validation errors`,
  );
}

function expectInvalid(
  result: ContextValidationResult,
  description: string,
): void {
  assert(!result.valid, `${description} should be invalid`);
  assert(
    result.errors.length > 0,
    `${description} should contain validation errors`,
  );
}

console.log("=== Context Validator Tests ===");

// ---------------------------------------------------------
// 1. Valid minimal context
// ---------------------------------------------------------

const minimalContext = buildContext({
  query: "Angular",
});

expectValid(validateContext(minimalContext), "minimal context");

console.log("✓ minimal context");

// ---------------------------------------------------------
// 2. Valid complete context
// ---------------------------------------------------------

const completeContext = buildContext({
  query: "Angular TypeScript project",

  entities: [
    {
      id: "angular",
      label: "Angular",
      type: "technology",
      confidence: 0.95,
      source: "query",
    },
  ],

  topics: ["frontend", "typescript"],

  goals: [
    {
      id: "goal-1",
      description: "Improve frontend architecture",
      priority: 0.9,
    },
  ],

  temporal: {
    referenceTime: new Date().toISOString(),
    isRelative: false,
  },

  project: "memory-service",

  constraints: [
    {
      type: "technology",
      value: "TypeScript",
      source: "query",
    },
  ],

  memories: [
    {
      id: "memory-1",
      relevance: 0.92,
    },
  ],

  knowledge: [
    {
      id: "angular",
      relevance: 0.88,
    },
  ],

  confidence: 0.9,
});

expectValid(validateContext(completeContext), "complete context");

console.log("✓ complete context");

// ---------------------------------------------------------
// 3. Empty query
// ---------------------------------------------------------

const emptyQueryContext = buildContext({
  query: "",
});

expectInvalid(validateContext(emptyQueryContext), "empty query");

console.log("✓ empty query rejected");

// ---------------------------------------------------------
// 4. Whitespace-only query
// ---------------------------------------------------------

const whitespaceQueryContext = buildContext({
  query: "   ",
});

expectInvalid(validateContext(whitespaceQueryContext), "whitespace-only query");

console.log("✓ whitespace-only query rejected");

// ---------------------------------------------------------
// 5. Confidence > 1
// ---------------------------------------------------------

const highConfidenceContext = {
  ...minimalContext,
  confidence: 1.5,
};

expectInvalid(validateContext(highConfidenceContext), "confidence > 1");

console.log("✓ confidence > 1 rejected");

// ---------------------------------------------------------
// 6. Confidence < 0
// ---------------------------------------------------------

const negativeConfidenceContext = {
  ...minimalContext,
  confidence: -0.1,
};

expectInvalid(validateContext(negativeConfidenceContext), "confidence < 0");

console.log("✓ confidence < 0 rejected");

// ---------------------------------------------------------
// 7. Missing id
// ---------------------------------------------------------

const missingIdContext = {
  ...minimalContext,
  id: "",
};

expectInvalid(validateContext(missingIdContext), "missing id");

console.log("✓ missing id rejected");

// ---------------------------------------------------------
// 8. Invalid entities collection
// ---------------------------------------------------------

const invalidEntitiesContext = {
  ...minimalContext,
  entities: null as never,
};

expectInvalid(
  validateContext(invalidEntitiesContext),
  "invalid entities collection",
);

console.log("✓ invalid entities collection rejected");

// ---------------------------------------------------------
// 9. Invalid entity
// ---------------------------------------------------------

const invalidEntityContext = {
  ...minimalContext,
  entities: [
    {
      id: "",
      label: "Angular",
      type: "technology",
      confidence: 0.9,
      source: "query" as const,
    },
  ],
};

expectInvalid(validateContext(invalidEntityContext), "invalid entity");

console.log("✓ invalid entity rejected");

// ---------------------------------------------------------
// 10. Invalid entity confidence
// ---------------------------------------------------------

const invalidEntityConfidenceContext = {
  ...minimalContext,
  entities: [
    {
      id: "angular",
      label: "Angular",
      type: "technology",
      confidence: 2,
      source: "query" as const,
    },
  ],
};

expectInvalid(
  validateContext(invalidEntityConfidenceContext),
  "invalid entity confidence",
);

console.log("✓ invalid entity confidence rejected");

// ---------------------------------------------------------
// 11. Invalid memory relevance
// ---------------------------------------------------------

const invalidMemoriesContext = {
  ...minimalContext,
  memories: [
    {
      id: "memory-1",
      relevance: 2,
    },
  ],
};

expectInvalid(
  validateContext(invalidMemoriesContext),
  "invalid memory relevance",
);

console.log("✓ invalid memory relevance rejected");

// ---------------------------------------------------------
// 12. Invalid knowledge relevance
// ---------------------------------------------------------

const invalidKnowledgeContext = {
  ...minimalContext,
  knowledge: [
    {
      id: "angular",
      relevance: -0.1,
    },
  ],
};

expectInvalid(
  validateContext(invalidKnowledgeContext),
  "invalid knowledge relevance",
);

console.log("✓ invalid knowledge relevance rejected");

// ---------------------------------------------------------
// 13. Invalid topics
// ---------------------------------------------------------

const invalidTopicsContext = {
  ...minimalContext,
  topics: null as never,
};

expectInvalid(validateContext(invalidTopicsContext), "invalid topics");

console.log("✓ invalid topics rejected");

// ---------------------------------------------------------
// 14. Invalid goals
// ---------------------------------------------------------

const invalidGoalsContext = {
  ...minimalContext,
  goals: null as never,
};

expectInvalid(validateContext(invalidGoalsContext), "invalid goals");

console.log("✓ invalid goals rejected");

// ---------------------------------------------------------
// 15. Invalid constraints
// ---------------------------------------------------------

const invalidConstraintsContext = {
  ...minimalContext,
  constraints: null as never,
};

expectInvalid(
  validateContext(invalidConstraintsContext),
  "invalid constraints",
);

console.log("✓ invalid constraints rejected");

// ---------------------------------------------------------
// 16. Invalid createdAt
// ---------------------------------------------------------

const invalidCreatedAtContext = {
  ...minimalContext,
  createdAt: "",
};

expectInvalid(validateContext(invalidCreatedAtContext), "invalid createdAt");

console.log("✓ invalid createdAt rejected");

// ---------------------------------------------------------
// 17. Multiple validation errors
// ---------------------------------------------------------

const multipleErrorsContext = {
  ...minimalContext,
  id: "",
  query: "",
  confidence: 2,
};

const multipleErrorsResult = validateContext(multipleErrorsContext);

expectInvalid(multipleErrorsResult, "multiple validation errors");

assert(
  multipleErrorsResult.errors.length >= 3,
  "multiple validation errors should report all detected errors",
);

console.log("✓ multiple validation errors reported");

// ---------------------------------------------------------
// Final result
// ---------------------------------------------------------

console.log("");
console.log("=== ALL CONTEXT VALIDATION TESTS PASSED ===");
