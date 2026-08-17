import { randomUUID } from "node:crypto";

import { memoryRepository } from "../core/container.js";

import { createEmbedding } from "../ai/ollama.service.js";

import { LifecycleService } from "./lifecycle.service.js";

import { MemoryType, type Memory } from "../memory/memory.types.js";

async function main() {
  console.log("==============================");
  console.log(" Lifecycle Consolidation Test");
  console.log("==============================");

  const project = `lifecycle-test-${randomUUID()}`;

  const memoryA: Memory = {
    id: randomUUID(),
    text: "El proyecto utiliza Qdrant como base de datos vectorial para almacenar embeddings.",
    project,
    type: MemoryType.FACT,
    importance: 0.8,
    confidence: 0.9,
    accessCount: 0,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    origin: "lifecycle-test",
  };

  const memoryB: Memory = {
    id: randomUUID(),
    text: "Qdrant almacena los embeddings de las memorias y permite realizar búsquedas vectoriales.",
    project,
    type: MemoryType.FACT,
    importance: 0.8,
    confidence: 0.9,
    accessCount: 0,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    origin: "lifecycle-test",
  };

  const createdIds = [memoryA.id!, memoryB.id!];

  try {
    console.log("\n1. Creating memories...\n");

    await memoryRepository.save(
      memoryA.id!,
      await createEmbedding(memoryA.text),
      memoryA,
    );

    await memoryRepository.save(
      memoryB.id!,
      await createEmbedding(memoryB.text),
      memoryB,
    );

    console.log(`Memory A: ${memoryA.id}`);
    console.log(`Memory B: ${memoryB.id}`);

    const vectorA = await createEmbedding(memoryA.text);

    const similar = await memoryRepository.findSimilar(
      vectorA,
      project,
      memoryA.id!,
    );

    console.log("\nSimilarity candidate:");
    console.dir(similar, { depth: null });

    console.log("\n2. Running lifecycle...\n");

    const lifecycle = new LifecycleService();

    await lifecycle.run();

    console.log("\n3. Validating consolidation...\n");

    const sourceA = await memoryRepository.findById(memoryA.id!);

    const sourceB = await memoryRepository.findById(memoryB.id!);

    if (!sourceA?.archived) {
      throw new Error("Memory A was not archived by lifecycle");
    }

    if (!sourceB?.archived) {
      throw new Error("Memory B was not archived by lifecycle");
    }

    const allMemories = await memoryRepository.getAll();

    const consolidated = allMemories.find(
      (memory) =>
        memory.origin === "consolidation" && memory.project === project,
    );

    if (!consolidated) {
      throw new Error("Lifecycle did not create consolidated memory");
    }

    createdIds.push(consolidated.id!);

    console.log(`Consolidated memory: ${consolidated.id}`);

    console.log("✓ Lifecycle executed");
    console.log("✓ Memory A archived");
    console.log("✓ Memory B archived");
    console.log("✓ Consolidated memory created");

    console.log("\n==============================");
    console.log(" Lifecycle Consolidation: PASS");
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
  console.error("\nLifecycle Consolidation: FAIL\n");

  console.error(error);

  process.exitCode = 1;
});
