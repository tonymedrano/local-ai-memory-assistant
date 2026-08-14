import { QueryAnalyzer } from "../intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "./retrieval.strategy.selector.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

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

    console.log(`✓ ${JSON.stringify(testCase.query)}`);
    console.log(`  → ${strategy.mode}`);
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

console.log("\n========================================");
console.log("RETRIEVAL STRATEGY TEST");
console.log("========================================");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${cases.length}`);

if (failed > 0) {
  process.exit(1);
}
