import { GraphRepository } from "../graph.repository.js";
import { graphStorage } from "../graph.storage.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Testing Knowledge Graph reference resolution...");

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function testReferenceResolution(): void {
  const originalGraph = deepClone(graphStorage.load());

  try {
    const repository = new GraphRepository();

    repository.clear();

    const first = repository.addNode({
      id: "angular",
      type: "technology",
      label: "Angular",
      createdAt: new Date().toISOString(),
    });

    const second = repository.addNode({
      id: "different-angular-id",
      type: "technology",
      label: " angular ",
      createdAt: new Date().toISOString(),
    });

    assert(
      first.id === second.id,
      "equivalent labels must resolve to the same node",
    );

    assert(
      repository.getGraph().nodes.length === 1,
      "identity equivalent nodes must not be duplicated",
    );

    const resolved = repository.resolveNode("ANGULAR");

    assert(resolved !== undefined, "reference must resolve");

    if (!resolved) {
      throw new Error("Assertion failed: reference must resolve");
    }

    assert(
      resolved.id === first.id,
      "resolved reference must point to the original node",
    );

    const graph = repository.getGraph();

    assert(
      graph.nodes[0].label === "angular",
      "stored label must be canonical",
    );
  } finally {
    graphStorage.save(originalGraph);
  }
}

try {
  console.log("Testing Knowledge Graph reference resolution...");

  testReferenceResolution();

  console.log("All reference resolver tests passed.");
} catch (error) {
  console.error(error);
  process.exit(1);
}
