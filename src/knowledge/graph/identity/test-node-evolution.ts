import { GraphRepository } from "../graph.repository.js";
import { graphStorage } from "../graph.storage.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function testNodeEvolution(): void {
  console.log("\n=== Knowledge Graph Node Evolution ===\n");

  const originalGraph = deepClone(graphStorage.load());

  try {
    const repository = new GraphRepository();

    repository.clear();

    const createdAt = "2026-08-23T10:00:00.000Z";

    const node = repository.addNode({
      id: "original-angular-id",
      type: "technology",
      label: "Angular",
      createdAt,
      metadata: {
        confidence: 0.8,
        content: "Frontend framework",
        knowledgeId: "knowledge-001",
      },
    });

    assert(node.id === "angular", "node must use canonical identity");

    assert(node.label === "angular", "node label must be canonical");

    /*
     * Simulate new evidence for the same entity.
     */
    const updated = repository.updateNode(node.id, {
      id: "malicious-new-id",
      label: "Completely Different Label",
      createdAt: "2030-01-01T00:00:00.000Z",
      type: "concept",
      metadata: {
        confidence: 0.95,
        content: "Updated Angular evidence",
        knowledgeId: "knowledge-002",
      },
    });

    assert(updated !== null, "existing node must be updated");

    if (!updated) {
      throw new Error("Assertion failed: existing node must be updated");
    }

    /*
     * Identity must survive evolution.
     */
    assert(updated.id === "angular", "node id must remain immutable");

    assert(
      updated.label === "angular",
      "node label must remain canonical and immutable",
    );

    assert(
      updated.createdAt === createdAt,
      "node creation timestamp must remain immutable",
    );

    /*
     * Mutable information may evolve.
     */
    assert(updated.type === "concept", "node type must be updated");

    assert(
      updated.metadata?.confidence === 0.95,
      "metadata confidence must be updated",
    );

    assert(
      updated.metadata?.content === "Updated Angular evidence",
      "metadata content must be updated",
    );

    assert(
      updated.metadata?.knowledgeId === "knowledge-002",
      "latest knowledge identity must be preserved in metadata",
    );

    /*
     * Graph must contain exactly one node.
     */
    assert(
      repository.getGraph().nodes.length === 1,
      "node evolution must not create duplicates",
    );

    console.log("✓ identity remains stable");
    console.log("✓ canonical label remains stable");
    console.log("✓ creation timestamp remains stable");
    console.log("✓ mutable evidence evolves");
    console.log("✓ no duplicate node created");

    console.log("\nAll node evolution tests passed.\n");
  } finally {
    graphStorage.save(originalGraph);
  }
}

try {
  testNodeEvolution();
} catch (error) {
  console.error(error);
  process.exit(1);
}
