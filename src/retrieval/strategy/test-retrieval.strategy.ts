import { QueryAnalyzer } from "../intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "./retrieval.strategy.selector.js";
import type { QueryProfile } from "../intelligence/query.types.js";
import type { RetrievalStrategy } from "./retrieval.strategy.js";
import { buildContextRetrievalSignals } from "../../context/retrieval/context.retrieval.signals.js";
import type { ContextModel } from "../../context/model/context.model.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function select(query: string): {
  profile: QueryProfile;
  strategy: RetrievalStrategy;
} {
  const profile = analyzer.analyze(query);
  const strategy = selector.select(profile);

  return {
    profile,
    strategy,
  };
}

console.log("=== Retrieval Strategy Selector Tests ===");

/*
 * -------------------------------------------------------
 * Basic strategy selection
 * -------------------------------------------------------
 */

{
  const { strategy } = select("angular signals");

  assert(
    strategy.mode === "hybrid",
    "angular signals should use hybrid retrieval",
  );

  console.log("✓ semantic/lexical query → hybrid");
}

{
  const { strategy } = select("what is Angular Signals?");

  assert(
    strategy.mode === "hybrid",
    "semantic question should use hybrid retrieval",
  );

  console.log("✓ semantic question → hybrid");
}

{
  const { strategy } = select("typescript interfaces");

  assert(
    strategy.mode === "hybrid",
    "typescript interfaces should use hybrid retrieval",
  );

  console.log("✓ technical query → hybrid");
}

/*
 * -------------------------------------------------------
 * Temporal retrieval
 * -------------------------------------------------------
 */

{
  const { strategy } = select("what did we decide about LTR yesterday?");

  assert(strategy.mode === "hybrid", "temporal query should remain hybrid");

  assert(
    strategy.temporalBoost === 0.9,
    "temporal query should receive temporal boost",
  );

  console.log("✓ temporal query → hybrid + temporal boost");
}

/*
 * -------------------------------------------------------
 * Relationship / graph retrieval
 * -------------------------------------------------------
 */

{
  const { strategy } = select(
    "¿qué relación existe entre Angular y TypeScript?",
  );

  assert(
    strategy.mode === "hybrid_graph",
    "complex relationship query should use hybrid_graph",
  );

  assert(
    strategy.topK === 20,
    "complex relationship query should increase topK",
  );

  assert(
    strategy.expandQuery === true,
    "complex relationship query should enable query expansion",
  );

  console.log("✓ complex relationship query → hybrid_graph");
}

{
  const { strategy } = select(
    "¿cómo están relacionados Angular Signals y TypeScript?",
  );

  assert(
    strategy.mode === "graph",
    "simple relationship query should use graph retrieval",
  );

  console.log("✓ relationship query → graph");
}

/*
 * -------------------------------------------------------
 * Comparison retrieval
 * -------------------------------------------------------
 */

{
  const { strategy } = select("¿cuál es la diferencia entre BM25 y RRF?");

  assert(
    strategy.mode === "hybrid",
    "comparison query should use hybrid retrieval",
  );

  assert(strategy.topK === 20, "complex comparison query should increase topK");

  assert(
    strategy.expandQuery === true,
    "complex comparison query should enable query expansion",
  );

  console.log("✓ comparison query → hybrid");
}

/*
 * -------------------------------------------------------
 * Exact lexical retrieval
 * -------------------------------------------------------
 */

{
  const { strategy } = select('"angular signals"');

  assert(
    strategy.mode === "keyword",
    "exact quoted terms should use keyword retrieval",
  );

  console.log("✓ exact terms → keyword");
}

/*
 * -------------------------------------------------------
 * Safe fallback
 * -------------------------------------------------------
 */

{
  const { strategy } = select("");

  assert(
    strategy.mode === "hybrid",
    "empty query should use safe hybrid fallback",
  );

  console.log("✓ empty query → hybrid fallback");
}

/*
 * -------------------------------------------------------
 * Context retrieval signals
 *
 * These tests verify that the contextual layer can expose
 * structured retrieval hints without mutating the context.
 * -------------------------------------------------------
 */

{
  const context: ContextModel = {
    id: "context-test",
    query: "Implementa el sistema usando Qdrant",
    entities: [
      {
        id: "qdrant",
        label: "Qdrant",
        type: "technology",
        confidence: 0.95,
        source: "query",
      },
    ],
    topics: ["database", "memory"],
    goals: [
      {
        id: "implement-system",
        description: "implementar el sistema de memoria",
        priority: 0.9,
      },
    ],
    constraints: [
      {
        type: "technology",
        value: "Qdrant",
        source: "query",
      },
    ],
    memories: [],
    knowledge: [],
    confidence: 1,
    createdAt: "2026-08-24T00:00:00.000Z",
  };

  const original = JSON.stringify(context);

  const signals = buildContextRetrievalSignals(context);

  assert(
    signals.entities.includes("Qdrant"),
    "context signals should expose entities",
  );

  assert(
    signals.topics.includes("database"),
    "context signals should expose topics",
  );

  assert(
    signals.goalTerms.includes("implementar"),
    "context signals should flatten goal terms",
  );

  assert(
    signals.constraints.some(
      (constraint) =>
        constraint.type === "technology" && constraint.value === "Qdrant",
    ),
    "context signals should expose constraints",
  );

  assert(
    JSON.stringify(context) === original,
    "building retrieval signals must not mutate context",
  );

  console.log("✓ contextual retrieval signals preserved");
}

/*
 * -------------------------------------------------------
 * Regression matrix
 * -------------------------------------------------------
 */

interface ExpectedStrategy {
  query: string;
  mode: string;
  temporalBoost?: number;
  topK?: number;
  expandQuery?: boolean;
}

const cases: ExpectedStrategy[] = [
  {
    query: "angular signals",
    mode: "hybrid",
  },
  {
    query: "what is Angular Signals?",
    mode: "hybrid",
  },
  {
    query: "typescript interfaces",
    mode: "hybrid",
  },
  {
    query: "Qdrant contextual_memory",
    mode: "hybrid",
  },
  {
    query: "MemoryRepository save",
    mode: "hybrid",
  },
  {
    query: "how did we solve the Qdrant problem?",
    mode: "hybrid",
  },
  {
    query: "what did we decide about LTR yesterday?",
    mode: "hybrid",
    temporalBoost: 0.9,
  },
  {
    query: "¿qué relación existe entre Angular y TypeScript?",
    mode: "hybrid_graph",
    topK: 20,
    expandQuery: true,
  },
  {
    query: "¿cómo están relacionados Angular Signals y TypeScript?",
    mode: "graph",
  },
  {
    query: "¿cuál es la diferencia entre BM25 y RRF?",
    mode: "hybrid",
    topK: 20,
    expandQuery: true,
  },
  {
    query: '"angular signals"',
    mode: "keyword",
  },
  {
    query: "retrieval",
    mode: "hybrid",
  },
  {
    query: "ranking",
    mode: "hybrid",
  },
  {
    query: "",
    mode: "hybrid",
  },
];

let passed = 0;
let failed = 0;

for (const testCase of cases) {
  const profile = analyzer.analyze(testCase.query);
  const strategy = selector.select(profile);

  const errors: string[] = [];

  if (strategy.mode !== testCase.mode) {
    errors.push(`mode expected=${testCase.mode}, actual=${strategy.mode}`);
  }

  if (
    testCase.temporalBoost !== undefined &&
    strategy.temporalBoost !== testCase.temporalBoost
  ) {
    errors.push(
      `temporalBoost expected=${testCase.temporalBoost}, actual=${strategy.temporalBoost}`,
    );
  }

  if (testCase.topK !== undefined && strategy.topK !== testCase.topK) {
    errors.push(`topK expected=${testCase.topK}, actual=${strategy.topK}`);
  }

  if (
    testCase.expandQuery !== undefined &&
    strategy.expandQuery !== testCase.expandQuery
  ) {
    errors.push(
      `expandQuery expected=${testCase.expandQuery}, actual=${strategy.expandQuery}`,
    );
  }

  if (errors.length === 0) {
    passed++;
  } else {
    failed++;

    console.error(`✗ ${JSON.stringify(testCase.query)}`);

    for (const error of errors) {
      console.error(`  ${error}`);
    }

    console.error("  Profile:");
    console.error(profile);

    console.error("  Strategy:");
    console.error(strategy);
  }
}

console.log("\n=== REGRESSION MATRIX ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${cases.length}`);

assert(
  failed === 0,
  `retrieval strategy regression matrix has ${failed} failure(s)`,
);

console.log("\n=== ALL RETRIEVAL STRATEGY SELECTOR TESTS PASSED ===");
