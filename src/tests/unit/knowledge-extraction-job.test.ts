import assert from "node:assert/strict";
import test from "node:test";

import { knowledgeExtractionJob } from "../../jobs/knowledge-extraction.job.js";
import type { MemoryItem } from "../../memory/memory.types.js";
import type { GraphConsistencyReport } from "../../knowledge/graph/consistency/graph.consistency.types.js";

function report(valid: boolean): GraphConsistencyReport {
  return {
    valid,
    errors: valid
      ? []
      : [
          {
            severity: "error",
            code: "ORPHAN_EDGE_TARGET",
            message: "Edge references a missing target node.",
          },
        ],
    warnings: [],
    stats: {
      nodes: 0,
      edges: 0,
      duplicateNodeIds: 0,
      duplicateEdgeIds: 0,
      duplicateNodeLabels: 0,
      duplicateSemanticIdentities: 0,
      orphanEdges: 0,
      duplicateSemanticEdges: 0,
    },
  };
}

test("extracts the full batch before synchronizing a valid graph", async () => {
  const steps: string[] = [];
  const memories: MemoryItem[] = [
    {
      id: "memory-1",
      text: "First memory",
      importance: 0.8,
      createdAt: "2026-08-31T00:00:00.000Z",
    },
    {
      id: "memory-2",
      text: "Second memory",
      importance: 0.8,
      createdAt: "2026-08-31T00:00:00.000Z",
    },
  ];

  await knowledgeExtractionJob({
    memoryRepository: {
      async findPendingKnowledgeExtraction() {
        steps.push("find-pending");
        return memories;
      },
      async markKnowledgeExtracted(id: string) {
        steps.push(`mark:${id}`);
      },
    },
    knowledgeService: {
      async processMemory(text: string) {
        steps.push(`extract:${text}`);
        return { subject: text } as never;
      },
    },
    knowledgeSyncService: {
      async sync() {
        steps.push("sync");
        return report(true);
      },
    },
  });

  assert.deepEqual(steps, [
    "find-pending",
    "extract:First memory",
    "mark:memory-1",
    "extract:Second memory",
    "mark:memory-2",
    "sync",
  ]);
});

test("fails the extraction job when graph consistency validation fails", async () => {
  await assert.rejects(
    knowledgeExtractionJob({
      memoryRepository: {
        async findPendingKnowledgeExtraction() {
          return [];
        },
        async markKnowledgeExtracted() {},
      },
      knowledgeService: {
        async processMemory() {
          return { subject: "unused" } as never;
        },
      },
      knowledgeSyncService: {
        async sync() {
          return report(false);
        },
      },
    }),
    /Graph synchronization failed consistency validation: Edge references a missing target node\./,
  );
});
