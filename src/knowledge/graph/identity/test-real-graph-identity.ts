import { graphStorage } from "../graph.storage.js";
import { GraphConsistencyService } from "../consistency/graph.consistency.js";
import type { KnowledgeGraph } from "../graph.types.js";
import { canonicalizeLabel } from "./identity.resolver.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function assertSameGraphIdentity(
  expected: KnowledgeGraph,
  actual: KnowledgeGraph,
): void {
  assert(
    expected.nodes.length === actual.nodes.length,
    "node count must survive persistence",
  );

  assert(
    expected.edges.length === actual.edges.length,
    "edge count must survive persistence",
  );

  for (const expectedNode of expected.nodes) {
    const actualNode = actual.nodes.find((node) => node.id === expectedNode.id);

    if (!actualNode) {
      throw new Error(
        `Assertion failed: node identity must survive persistence: ${expectedNode.id}`,
      );
    }

    assert(
      actualNode.label === expectedNode.label,
      `node label must survive persistence: ${expectedNode.id}`,
    );

    assert(
      actualNode.label === expectedNode.label,
      `node label must survive persistence: ${expectedNode.id}`,
    );

    assert(
      actualNode.type === expectedNode.type,
      `node type must survive persistence: ${expectedNode.id}`,
    );

    assert(
      canonicalizeLabel(actualNode.label) ===
        canonicalizeLabel(expectedNode.label),
      `canonical node identity must survive persistence: ${expectedNode.id}`,
    );

    assert(
      actualNode.id === expectedNode.id,
      `node id must remain stable: ${expectedNode.id}`,
    );
  }

  for (const expectedEdge of expected.edges) {
    const actualEdge = actual.edges.find((edge) => edge.id === expectedEdge.id);

    if (!actualEdge) {
      throw new Error(
        `Assertion failed: edge identity must survive persistence: ${expectedEdge.id}`,
      );
    }

    assert(
      actualEdge.source === expectedEdge.source,
      `edge source must survive persistence: ${expectedEdge.id}`,
    );

    assert(
      actualEdge.source === expectedEdge.source,
      `edge source must survive persistence: ${expectedEdge.id}`,
    );

    assert(
      actualEdge.target === expectedEdge.target,
      `edge target must survive persistence: ${expectedEdge.id}`,
    );

    assert(
      actualEdge.relation === expectedEdge.relation,
      `edge relation must survive persistence: ${expectedEdge.id}`,
    );
  }
}

function assertIdentityUniqueness(graph: KnowledgeGraph): void {
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const node of graph.nodes) {
    assert(
      !nodeIds.has(node.id),
      `duplicate node identity after persistence: ${node.id}`,
    );

    nodeIds.add(node.id);
  }

  for (const edge of graph.edges) {
    assert(
      !edgeIds.has(edge.id),
      `duplicate edge identity after persistence: ${edge.id}`,
    );

    edgeIds.add(edge.id);
  }
}

function testRealGraphIdentityPersistence(): void {
  console.log("\n=== Real Graph Identity Validation ===\n");

  const original = deepClone(graphStorage.load());

  try {
    const consistencyService = new GraphConsistencyService();

    const initialReport = consistencyService.validate(original);

    assert(
      initialReport.valid,
      "real graph must be consistent before identity validation",
    );

    console.log(
      `Initial graph: ${original.nodes.length} nodes, ${original.edges.length} edges`,
    );

    assertIdentityUniqueness(original);

    /*
     * Persistence cycle #1
     */
    graphStorage.save(original);

    const firstReload = graphStorage.load();

    assertSameGraphIdentity(original, firstReload);
    assertIdentityUniqueness(firstReload);

    const firstReport = consistencyService.validate(firstReload);

    assert(
      firstReport.valid,
      "graph must remain consistent after first persistence cycle",
    );

    console.log("✓ first persistence cycle preserves identity");

    /*
     * Persistence cycle #2
     */
    graphStorage.save(firstReload);

    const secondReload = graphStorage.load();

    assertSameGraphIdentity(firstReload, secondReload);
    assertIdentityUniqueness(secondReload);

    const secondReport = consistencyService.validate(secondReload);

    assert(
      secondReport.valid,
      "graph must remain consistent after second persistence cycle",
    );

    console.log("✓ second persistence cycle preserves identity");

    /*
     * Referential integrity
     */
    for (const edge of secondReload.edges) {
      assert(
        secondReload.nodes.some((node) => node.id === edge.source),
        `edge source must resolve after reload: ${edge.id}`,
      );

      assert(
        secondReload.nodes.some((node) => node.id === edge.target),
        `edge target must resolve after reload: ${edge.id}`,
      );
    }

    console.log("✓ edge references resolve after reload");

    console.log(
      `\nReal graph identity validated: ` +
        `${secondReload.nodes.length} nodes, ` +
        `${secondReload.edges.length} edges`,
    );

    console.log("\nAll real graph identity tests passed.\n");
  } finally {
    /*
     * Never leave the real storage modified by the test.
     */
    graphStorage.save(original);
  }
}


const originalGraph = deepClone(graphStorage.load());

try {
  testRealGraphIdentityPersistence();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
   graphStorage.save(originalGraph);
}
