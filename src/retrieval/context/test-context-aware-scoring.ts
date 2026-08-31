import assert from "node:assert/strict";

import { MemoryType, type Memory } from "../../memory/memory.types.js";

import { buildContext } from "../../context/model/context.builder.js";

import { ContextAwareScoringService } from "./context-aware-scoring.service.js";

const scorer = new ContextAwareScoringService();

const now = Date.now();

function createMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: "memory-001",

    text: "Angular uses TypeScript for frontend development",

    project: "memory-service",

    type: MemoryType.SOLUTION,

    importance: 0.8,

    confidence: 0.9,

    tags: ["Angular", "TypeScript", "frontend"],

    createdAt: new Date(now).toISOString(),

    updatedAt: new Date(now).toISOString(),

    ...overrides,
  };
}

// ---------------------------------------------------------
// 1. Same project
// ---------------------------------------------------------

{
  const memory = createMemory();

  const context = buildContext({
    query: "Angular",
    project: "memory-service",
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.projectMatch, 1);

  console.log("✓ same project increases project match");
}

// ---------------------------------------------------------
// 2. Different project
// ---------------------------------------------------------

{
  const memory = createMemory();

  const context = buildContext({
    query: "Angular",
    project: "other-project",
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.projectMatch, 0);

  console.log("✓ different project lowers project match");
}

// ---------------------------------------------------------
// 3. Matching topic/tag
// ---------------------------------------------------------

{
  const memory = createMemory();

  const context = buildContext({
    query: "Angular",
    topics: ["Angular"],
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.tagMatch, 1);

  console.log("✓ matching topic produces tag match");
}

// ---------------------------------------------------------
// 4. Temporal match
// ---------------------------------------------------------

{
  const memory = createMemory({
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),

    updatedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
  });

  const context = buildContext({
    query: "recent Angular work",

    temporal: {
      referenceTime: new Date(now).toISOString(),

      from: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),

      to: new Date(now).toISOString(),

      isRelative: false,
    },
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.temporalMatch, 1);

  console.log("✓ temporal context matches memory");
}

// ---------------------------------------------------------
// 5. Explicit memory reference
// ---------------------------------------------------------

{
  const memory = createMemory({
    id: "memory-123",
  });

  const context = buildContext({
    query: "continue previous work",

    memories: [
      {
        id: "memory-123",
        relevance: 0.92,
      },
    ],
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.memoryReference, 0.92);

  console.log("✓ explicit memory reference preserves relevance");
}

// ---------------------------------------------------------
// 6. Unreferenced memory
// ---------------------------------------------------------

{
  const memory = createMemory({
    id: "memory-999",
  });

  const context = buildContext({
    query: "continue previous work",

    memories: [
      {
        id: "memory-123",
        relevance: 0.92,
      },
    ],
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.equal(result.memoryReference, 0);

  console.log("✓ unrelated memory has no memory-reference score");
}

// ---------------------------------------------------------
// 7. No context → neutral
// ---------------------------------------------------------

{
  const memory = createMemory();

  const result = scorer.score({
    memory,
  });

  assert.equal(result.score, 0.5);

  assert.equal(result.projectMatch, 0.5);

  assert.equal(result.tagMatch, 0.5);

  assert.equal(result.temporalMatch, 0.5);

  assert.equal(result.memoryReference, 0.5);

  console.log("✓ missing context returns neutral score");
}

// ---------------------------------------------------------
// 8. Score normalization
// ---------------------------------------------------------

{
  const memory = createMemory({
    id: "memory-123",
  });

  const context = buildContext({
    query: "Angular",
    project: "memory-service",
    topics: ["Angular", "TypeScript"],
    memories: [
      {
        id: "memory-123",
        relevance: 1,
      },
    ],
  });

  const result = scorer.score({
    memory,
    context,
  });

  assert.ok(result.score >= 0 && result.score <= 1);

  console.log("✓ context score is normalized");
}

console.log("\n=== Context-Aware Scoring Tests ===");

console.log("All context-aware scoring tests passed.");
