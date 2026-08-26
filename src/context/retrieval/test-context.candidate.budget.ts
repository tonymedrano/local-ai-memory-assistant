import assert from "node:assert/strict";

import {
  applyContextToCandidateBudget,
  type CandidateBudget,
} from "./context.candidate.budget.js";

import type { ContextModel } from "../model/context.model.js";

const baseBudget: CandidateBudget = {
  vector: 5,
  keyword: 5,
  graph: 5,
  graphEvidence: 5,
  total: 20,
};

function createContext(overrides: Partial<ContextModel> = {}): ContextModel {
  return {
    id: "budget-test",
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

console.log("=== Context-Aware Candidate Budget Tests ===");

const empty = applyContextToCandidateBudget(baseBudget);

assert.deepEqual(
  empty,
  baseBudget,
  "empty context must preserve candidate budget",
);

console.log("✓ empty context preserves base budget");

const goals = applyContextToCandidateBudget(
  baseBudget,
  createContext({
    goals: [
      {
        id: "goal-1",
        description: "improve retrieval",
        priority: 1,
      },
    ],
  }),
);

assert.equal(goals.vector, 7);
assert.equal(goals.keyword, 5);
assert.equal(goals.graph, 5);
assert.equal(goals.graphEvidence, 5);
assert.equal(goals.total, 22);

console.log("✓ goals increase vector candidate budget");

const topics = applyContextToCandidateBudget(
  baseBudget,
  createContext({
    topics: ["retrieval"],
  }),
);

assert.equal(topics.vector, 6);
assert.equal(topics.total, 21);

console.log("✓ topics increase vector candidate budget");

const constraints = applyContextToCandidateBudget(
  baseBudget,
  createContext({
    constraints: [
      {
        type: "restriction",
        value: "MongoDB",
        source: "query",
      },
    ],
  }),
);

assert.equal(constraints.keyword, 7);
assert.equal(constraints.total, 22);

console.log("✓ constraints increase keyword candidate budget");

const entities = applyContextToCandidateBudget(
  baseBudget,
  createContext({
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
  }),
);

assert.equal(entities.graph, 7);
assert.equal(entities.graphEvidence, 7);
assert.equal(entities.total, 24);

console.log("✓ multiple entities increase graph budgets");

const temporal = applyContextToCandidateBudget(
  baseBudget,
  createContext({
    temporal: {
      referenceTime: "2026-08-24T00:00:00.000Z",
      from: "2026-08-23T00:00:00.000Z",
      to: "2026-08-24T00:00:00.000Z",
      isRelative: true,
    },
  }),
);

assert.equal(temporal.vector, 6);
assert.equal(temporal.keyword, 6);
assert.equal(temporal.total, 22);

console.log("✓ temporal context increases candidate coverage");

const combined = applyContextToCandidateBudget(
  baseBudget,
  createContext({
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
    topics: ["retrieval"],
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
    temporal: {
      referenceTime: "2026-08-24T00:00:00.000Z",
      from: "2026-08-23T00:00:00.000Z",
      to: "2026-08-24T00:00:00.000Z",
      isRelative: true,
    },
  }),
);

assert.equal(combined.vector, 9);
assert.equal(combined.keyword, 8);
assert.equal(combined.graph, 7);
assert.equal(combined.graphEvidence, 7);
assert.equal(combined.total, 31);

console.log("✓ combined context produces cumulative budget");

const original = { ...baseBudget };

applyContextToCandidateBudget(
  baseBudget,
  createContext({
    topics: ["retrieval"],
    goals: [
      {
        id: "goal-1",
        description: "improve retrieval",
        priority: 1,
      },
    ],
  }),
);

assert.deepEqual(baseBudget, original, "base budget must remain immutable");

console.log("✓ base budget remains immutable");

console.log("\n=== ALL CONTEXT-AWARE CANDIDATE BUDGET TESTS PASSED ===");
