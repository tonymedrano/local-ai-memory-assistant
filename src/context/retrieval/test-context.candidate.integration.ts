import assert from "node:assert/strict";

import {
  applyContextToCandidateBudget,
} from "./context.candidate.budget.js";

import type { ContextModel } from "../model/context.model.js";

function createContext(
  overrides: Partial<ContextModel> = {},
): ContextModel {
  return {
    id: "integration-test",
    query: "test",
    entities: [],
    topics: [],
    goals: [],
    constraints: [],
    memories: [],
    knowledge: [],
    confidence: 1,
    createdAt: "2026-08-24T00:00:00.000Z",
    ...overrides,
  };
}

console.log("=== Context-Aware Candidate Retrieval Integration Tests ===");

const base = {
  vector: 5,
  keyword: 5,
  graph: 5,
  graphEvidence: 5,
  total: 20,
};

const context = createContext({
  entities: [
    {
      id: "angular",
      label: "Angular",
      confidence: 1,
      source: "query",
    },
    {
      id: "typescript",
      label: "TypeScript",
      confidence: 1,
      source: "query",
    },
  ],
  goals: [
    {
      id: "goal-1",
      description: "improve retrieval",
      priority: 1,
    },
  ],
  constraints: [
    {
      type: "restriction",
      value: "MongoDB",
      source: "query",
    },
  ],
  topics: ["retrieval"],
});

const budget = applyContextToCandidateBudget(
  base,
  context,
);

assert.equal(
  budget.vector,
  8,
  "goals and topics should increase vector budget",
);

assert.equal(
  budget.keyword,
  7,
  "constraints should increase keyword budget",
);

assert.equal(
  budget.graph,
  7,
  "entities should increase graph budget",
);

assert.equal(
  budget.graphEvidence,
  7,
  "entities should increase graph-evidence budget",
);

assert.equal(
  budget.total,
  29,
  "total budget should equal all candidate channels",
);

console.log("✓ contextual signals reach all candidate channels");

const emptyBudget = applyContextToCandidateBudget(
  base,
  undefined,
);

assert.deepEqual(
  emptyBudget,
  base,
  "no context must preserve retrieval behavior",
);

console.log("✓ no context preserves retrieval budget");

const original = { ...base };

applyContextToCandidateBudget(
  base,
  context,
);

assert.deepEqual(
  base,
  original,
  "retrieval base budget remains immutable",
);

console.log("✓ base candidate budget remains immutable");

console.log(
  "\n=== ALL CONTEXT-AWARE CANDIDATE RETRIEVAL INTEGRATION TESTS PASSED ===",
);
