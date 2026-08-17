import crypto from "node:crypto";

import { createEmbedding } from "../ai/ollama.service.js";
import { memoryRepository } from "../core/container.js";
import { KnowledgeRepository } from "../knowledge/knowledge.repository.js";
import { knowledgeExtractionJob } from "./knowledge-extraction.job.js";

async function main() {
  console.log("==============================");
  console.log(" Knowledge Extraction Integration Test");
  console.log("==============================");

  const memoryId = crypto.randomUUID();

  const text = `
Angular Native Federation usa un shell llamado sp-shell.
Qdrant almacena embeddings.
Continue conecta con memory-service mediante MCP.
`.trim();

  const knowledgeRepository = new KnowledgeRepository();

  try {
    console.log("\n1. Creating test memory...\n");

    const vector = await createEmbedding(text);

    await memoryRepository.save(memoryId, vector, {
      id: memoryId,
      text,
      importance: 0.9,
      confidence: 0.9,
      accessCount: 0,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin: "knowledge-extraction-test",
      knowledgeExtracted: false,
    });

    console.log(`Memory: ${memoryId}`);

    console.log("\n2. Validating pending state...\n");

    const pendingBefore =
      await memoryRepository.findPendingKnowledgeExtraction();

    const pendingMemory = pendingBefore.find(
      (memory) => memory.id === memoryId,
    );

    if (!pendingMemory) {
      throw new Error(
        "Test memory was not found in pending knowledge extraction",
      );
    }

    console.log("✓ Memory is pending extraction");

    const knowledgeBefore = await knowledgeRepository.findAll();

    console.log(`Knowledge items before: ${knowledgeBefore.length}`);

    console.log("\n3. Running knowledge extraction job...\n");

    await knowledgeExtractionJob();

    console.log("\n4. Validating memory state...\n");

    const processedMemory = await memoryRepository.findById(memoryId);

    if (!processedMemory) {
      throw new Error("Test memory could not be found after extraction");
    }

    if (!processedMemory.knowledgeExtracted) {
      throw new Error("Memory was not marked as knowledgeExtracted");
    }

    console.log("✓ Memory marked as knowledgeExtracted");

    console.log("\n5. Validating extracted knowledge...\n");

    const knowledgeAfterRepository = new KnowledgeRepository();

    const knowledgeAfter = await knowledgeAfterRepository.findAll();

    if (knowledgeAfter.length <= knowledgeBefore.length) {
      throw new Error(
        "Knowledge extraction did not persist a new knowledge item",
      );
    }

    const newKnowledge = knowledgeAfter.slice(knowledgeBefore.length);

    if (newKnowledge.length === 0) {
      throw new Error("No new knowledge item was persisted");
    }

    for (const item of newKnowledge) {
      console.log(`✓ Knowledge extracted: ${item.subject}`);
    }

    console.log("\n6. Running extraction job again...\n");

    const knowledgeBeforeSecondRun = await new KnowledgeRepository().findAll();

    await knowledgeExtractionJob();

    const knowledgeAfterSecondRun = await new KnowledgeRepository().findAll();

    if (knowledgeAfterSecondRun.length !== knowledgeBeforeSecondRun.length) {
      throw new Error("Second extraction run created duplicate knowledge");
    }

    console.log("✓ Second run created no duplicate knowledge");

    console.log("\n==============================");
    console.log(" Knowledge Extraction: PASS");
    console.log("==============================");
  } finally {
    console.log("\nCleaning test memory...");

    await memoryRepository.delete(memoryId);

    console.log("✓ Test memory removed");
  }
}

main().catch((error) => {
  console.error("\nKnowledge Extraction: FAIL\n");
  console.error(error);
  process.exitCode = 1;
});
