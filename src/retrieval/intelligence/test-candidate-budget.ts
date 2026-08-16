import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";
import { CandidateBudgeting } from "./candidate.budget.js";


const budgeting = new CandidateBudgeting();

function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

function assertBudget(
  actual: ReturnType<CandidateBudgeting["calculate"]>,
  expected: ReturnType<CandidateBudgeting["calculate"]>,
  name: string,
): void {
  assertEqual(actual.vector, expected.vector, `${name} → vector`);
  assertEqual(actual.keyword, expected.keyword, `${name} → keyword`);
  assertEqual(actual.graph, expected.graph, `${name} → graph`);
  assertEqual(
    actual.graphEvidence,
    expected.graphEvidence,
    `${name} → graphEvidence`,
  );
  assertEqual(actual.total, expected.total, `${name} → total`);

  assertEqual(
    actual.total,
    actual.vector + actual.keyword + actual.graph + actual.graphEvidence,
    `${name} → total consistency`,
  );
}

function testVectorStrategy(): void {
  const strategy: RetrievalStrategy = {
    mode: "vector",
    vectorWeight: 1,
    keywordWeight: 0,
    graphWeight: 0,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: false,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 10,
      keyword: 0,
      graph: 0,
      graphEvidence: 0,
      total: 10,
    },
    "vector strategy",
  );
}

function testKeywordStrategy(): void {
  const strategy: RetrievalStrategy = {
    mode: "keyword",
    vectorWeight: 0,
    keywordWeight: 1,
    graphWeight: 0,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: false,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 0,
      keyword: 10,
      graph: 0,
      graphEvidence: 0,
      total: 10,
    },
    "keyword strategy",
  );
}

function testHybridStrategy(): void {
  const strategy: RetrievalStrategy = {
    mode: "hybrid",
    vectorWeight: 0.6,
    keywordWeight: 0.4,
    graphWeight: 0,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: false,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 6,
      keyword: 4,
      graph: 0,
      graphEvidence: 0,
      total: 10,
    },
    "hybrid strategy",
  );
}

function testHybridGraphStrategy(): void {
  const strategy: RetrievalStrategy = {
    mode: "hybrid_graph",
    vectorWeight: 0.5,
    keywordWeight: 0.2,
    graphWeight: 0.2,
    graphEvidenceWeight: 0.1,
    topK: 20,
    expandQuery: true,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 10,
      keyword: 4,
      graph: 4,
      graphEvidence: 2,
      total: 20,
    },
    "hybrid graph strategy",
  );
}

function testGraphStrategy(): void {
  const strategy: RetrievalStrategy = {
    mode: "graph",
    vectorWeight: 0,
    keywordWeight: 0,
    graphWeight: 1,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: true,
    rerank: false,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 0,
      keyword: 0,
      graph: 10,
      graphEvidence: 0,
      total: 10,
    },
    "graph strategy",
  );
}

function testGraphEvidence(): void {
  const strategy: RetrievalStrategy = {
    mode: "graph",
    vectorWeight: 0,
    keywordWeight: 0,
    graphWeight: 0,
    graphEvidenceWeight: 1,
    topK: 10,
    expandQuery: true,
    rerank: false,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 0,
      keyword: 0,
      graph: 0,
      graphEvidence: 10,
      total: 10,
    },
    "graph evidence",
  );
}

function testZeroWeights(): void {
  const strategy: RetrievalStrategy = {
    mode: "hybrid",
    vectorWeight: 0,
    keywordWeight: 0,
    graphWeight: 0,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: false,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 10,
      keyword: 0,
      graph: 0,
      graphEvidence: 0,
      total: 10,
    },
    "zero weights fallback",
  );
}

function testRounding(): void {
  const strategy: RetrievalStrategy = {
    mode: "hybrid_graph",
    vectorWeight: 1,
    keywordWeight: 1,
    graphWeight: 1,
    graphEvidenceWeight: 0,
    topK: 10,
    expandQuery: true,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 4,
      keyword: 3,
      graph: 3,
      graphEvidence: 0,
      total: 10,
    },
    "rounding",
  );
}

function testSmallTopK(): void {
  const strategy: RetrievalStrategy = {
    mode: "hybrid_graph",
    vectorWeight: 0.5,
    keywordWeight: 0.5,
    graphWeight: 0,
    graphEvidenceWeight: 0,
    topK: 1,
    expandQuery: false,
    rerank: true,
    temporalBoost: 0,
  };

  const result = budgeting.calculate(strategy);

  assertBudget(
    result,
    {
      vector: 1,
      keyword: 0,
      graph: 0,
      graphEvidence: 0,
      total: 1,
    },
    "small topK",
  );
}

function run(): void {
  console.log("=== Candidate Budgeting Tests ===");

  testVectorStrategy();
  console.log("✓ vector strategy");

  testKeywordStrategy();
  console.log("✓ keyword strategy");

  testHybridStrategy();
  console.log("✓ hybrid strategy");

  testHybridGraphStrategy();
  console.log("✓ hybrid graph strategy");

  testGraphStrategy();
  console.log("✓ graph strategy");

  testGraphEvidence();
  console.log("✓ graph evidence");

  testZeroWeights();
  console.log("✓ zero weights fallback");

  testRounding();
  console.log("✓ rounding");

  testSmallTopK();
  console.log("✓ small topK");

  console.log("\nAll Candidate Budgeting tests passed.");
}

run();
