import { randomUUID } from "node:crypto";

import {
  consolidationService,
  memoryRepository,
} from "../../core/container.js";

import { createEmbedding } from "../../ai/ollama.service.js";

import { MemoryType, type Memory } from "../memory.types.js";

async function main() {
  console.log("==============================");
  console.log(" Memory Consolidation Test");
  console.log("==============================");

  const project = `consolidation-test-${randomUUID()}`;

  const memoryA: Memory = {
    id: randomUUID(),
    text: "El proyecto utiliza Qdrant como base de datos vectorial para almacenar embeddings de las memorias.",
    project,
    type: MemoryType.FACT,
    importance: 0.8,
    confidence: 0.9,
    accessCount: 3,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    origin: "consolidation-test",
  };

  const memoryB: Memory = {
    id: randomUUID(),
    text: "Qdrant se utiliza en el proyecto para almacenar los embeddings asociados a las memorias y permitir su recuperación vectorial.",
    project,
    type: MemoryType.FACT,
    importance: 0.7,
    confidence: 0.8,
    accessCount: 2,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    origin: "consolidation-test",
  };

  const createdIds = [memoryA.id, memoryB.id] as string[];

  try {
    console.log("\n1. Creating test memories...\n");

    const embeddingA = await createEmbedding(memoryA.text);

    const embeddingB = await createEmbedding(memoryB.text);

    await memoryRepository.save(memoryA.id!, embeddingA, memoryA);

    await memoryRepository.save(memoryB.id!, embeddingB, memoryB);

    console.log(`Memory A: ${memoryA.id}`);
    console.log(`Memory B: ${memoryB.id}`);

    console.log("\n2. Consolidating...\n");

    const result = await consolidationService.consolidateById(memoryA.id!);

    console.log(JSON.stringify(result, null, 2));

    if (!result.consolidated) {
      throw new Error(`Expected consolidation to succeed: ${result.reason}`);
    }

    if (!result.memory?.id) {
      throw new Error("Consolidation did not produce a memory ID");
    }

    createdIds.push(result.memory.id);

    console.log("\n3. Validating consolidated memory...\n");

    const consolidated = await memoryRepository.findById(result.memory.id);

    if (!consolidated) {
      throw new Error("Consolidated memory was not persisted");
    }

    if (consolidated.archived) {
      throw new Error("Consolidated memory must remain active");
    }

    if (consolidated.origin !== "consolidation") {
      throw new Error("Invalid consolidated memory origin");
    }

    const consolidationMetadata = consolidated.metadata?.consolidation as
      | {
          type?: string;
          sourceMemoryIds?: string[];
        }
      | undefined;

    if (consolidationMetadata?.type !== "consolidated") {
      throw new Error("Missing consolidated metadata");
    }

    const sourceIds = consolidationMetadata.sourceMemoryIds ?? [];

    if (!sourceIds.includes(memoryA.id!) || !sourceIds.includes(memoryB.id!)) {
      throw new Error(
        "Consolidated memory does not reference both source memories",
      );
    }

    console.log("✓ Consolidated memory persisted");
    console.log("✓ Consolidated memory is active");
    console.log("✓ Origin is correct");
    console.log("✓ Source memory IDs preserved");

    console.log("\n4. Validating source memories...\n");

    const sourceA = await memoryRepository.findById(memoryA.id!);

    const sourceB = await memoryRepository.findById(memoryB.id!);

    if (!sourceA?.archived) {
      throw new Error("Memory A was not archived");
    }

    if (!sourceB?.archived) {
      throw new Error("Memory B was not archived");
    }

    const sourceMetadataA = sourceA.metadata?.consolidation as
      | {
          type?: string;
          consolidatedInto?: string;
        }
      | undefined;

    const sourceMetadataB = sourceB.metadata?.consolidation as
      | {
          type?: string;
          consolidatedInto?: string;
        }
      | undefined;

    if (
      sourceMetadataA?.type !== "source" ||
      sourceMetadataA.consolidatedInto !== result.memory.id
    ) {
      throw new Error("Memory A consolidation trace is invalid");
    }

    if (
      sourceMetadataB?.type !== "source" ||
      sourceMetadataB.consolidatedInto !== result.memory.id
    ) {
      throw new Error("Memory B consolidation trace is invalid");
    }

    console.log("✓ Memory A archived");
    console.log("✓ Memory B archived");
    console.log("✓ Memory A trace preserved");
    console.log("✓ Memory B trace preserved");

    console.log("\n==============================");
    console.log(" Memory Consolidation: PASS");
    console.log("==============================");
  } finally {
    console.log("\nCleaning test memories...");

    for (const id of createdIds) {
      await memoryRepository.delete(id);
    }

    console.log("✓ Test data removed");
  }
}

main().catch((error) => {
  console.error("\nMemory Consolidation: FAIL\n");
  console.error(error);
  process.exitCode = 1;
});
