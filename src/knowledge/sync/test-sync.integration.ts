import { randomUUID } from "node:crypto";

import { KnowledgeRepository } from "../knowledge.repository.js";
import { KnowledgeSyncService } from "./knowledge-sync.service.js";
import { GraphRepository } from "../graph/graph.repository.js";

import type { KnowledgeItem } from "../knowledge.types.js";

async function main() {
  console.log("==============================");
  console.log(" Knowledge Sync Integration Test");
  console.log("==============================");

  const knowledgeRepository = new KnowledgeRepository();
  const graphRepository = new GraphRepository();
  const originalGraph = structuredClone(graphRepository.getGraph());

  const sourceId = randomUUID();
  const targetId = randomUUID();

  const sourceSubject = `Qdrant-${randomUUID()}`;
  const targetSubject = `Embeddings-${randomUUID()}`;

  const sourceKnowledge: KnowledgeItem = {
    id: sourceId,
    type: "technology",
    subject: sourceSubject,
    content: "Qdrant almacena embeddings.",
    relations: [
      {
        source: sourceSubject,
        relation: "stores",
        target: targetSubject,
      },
    ],
    confidence: 0.95,
    createdAt: new Date(),
  };

  const targetKnowledge: KnowledgeItem = {
    id: targetId,
    type: "fact",
    subject: targetSubject,
    content: "Representaciones vectoriales utilizadas para búsqueda semántica.",
    relations: [],
    confidence: 0.9,
    createdAt: new Date(),
  };

  try {
    console.log("\n1. Creating test knowledge...");

    const before = await knowledgeRepository.findAll();

    await knowledgeRepository.save(sourceKnowledge);
    await knowledgeRepository.save(targetKnowledge);

    console.log(`Source: ${sourceSubject}`);
    console.log(`Target: ${targetSubject}`);

    console.log("\n2. Running first sync...\n");

    const sync = new KnowledgeSyncService(knowledgeRepository, graphRepository);

    await sync.sync();

    const sourceNode = graphRepository.findByLabel(sourceSubject);
    const targetNode = graphRepository.findByLabel(targetSubject);

    if (!sourceNode) {
      throw new Error("Source node was not created");
    }

    if (!targetNode) {
      throw new Error("Target node was not created");
    }

    console.log("✓ Source node created");
    console.log("✓ Target node created");

    const edge = graphRepository.findEdge(
      sourceNode.id,
      "stores",
      targetNode.id,
    );

    if (!edge) {
      throw new Error("Expected relationship was not created");
    }

    console.log("✓ Relationship created");
    console.log(`✓ Edge: ${sourceSubject} --stores--> ${targetSubject}`);

    if (edge.confidence !== sourceKnowledge.confidence) {
      throw new Error(`Unexpected edge confidence: ${edge.confidence}`);
    }

    console.log("✓ Relationship confidence preserved");

    console.log("\n3. Running second sync...\n");

    await sync.sync();

    const edges = graphRepository
      .getEdgesFrom(sourceNode.id)
      .filter(
        (item) => item.relation === "stores" && item.target === targetNode.id,
      );

    if (edges.length !== 1) {
      throw new Error(
        `Expected exactly one relationship after second sync, found ${edges.length}`,
      );
    }

    console.log("✓ Sync is idempotent");
    console.log("✓ No duplicate relationship created");

    console.log("\n==============================");
    console.log(" Knowledge Sync: PASS");
    console.log("==============================");
  } finally {
    console.log("\nCleaning test knowledge...");

    const current = await knowledgeRepository.findAll();

    await knowledgeRepository.replaceAll(
      current.filter((item) => item.id !== sourceId && item.id !== targetId),
    );

    graphRepository.getGraph().nodes = originalGraph.nodes;
    graphRepository.getGraph().edges = originalGraph.edges;

    console.log("✓ Test data removed");
  }
}

main().catch((error) => {
  console.error("\nKnowledge Sync: FAIL\n");
  console.error(error);
  process.exitCode = 1;
});
