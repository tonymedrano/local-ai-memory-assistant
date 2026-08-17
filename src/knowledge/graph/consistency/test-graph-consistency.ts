import type { GraphEdge, GraphNode, KnowledgeGraph } from "../graph.types.js";
import { GraphConsistencyService } from "./graph.consistency.js";

const validator = new GraphConsistencyService();

function node(
  id: string,
  label = id,
  type: GraphNode["type"] = "concept",
): GraphNode {
  return {
    id,
    type,
    label,
    createdAt: new Date().toISOString(),
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  relation = "uses",
  confidence = 0.8,
): GraphEdge {
  return {
    id,
    source,
    target,
    relation,
    confidence,
    createdAt: new Date().toISOString(),
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testValidGraph(): void {
  const graph: KnowledgeGraph = {
    nodes: [
      node("angular", "Angular", "technology"),
      node("typescript", "TypeScript", "technology"),
    ],

    edges: [edge("angular-uses-typescript", "angular", "typescript")],
  };

  const report = validator.validate(graph);

  assert(report.valid, "valid graph should be valid");

  assert(report.errors.length === 0, "valid graph should have no errors");
}

function testDuplicateNodeId(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular", "Angular"), node("angular", "Angular 2")],

    edges: [],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "duplicate node id should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "DUPLICATE_NODE_ID"),
    "duplicate node id should be reported",
  );
}

function testDuplicateLabel(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular", "Angular"), node("angular-2", "angular")],

    edges: [],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "duplicate label should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "DUPLICATE_NODE_LABEL"),
    "duplicate label should be reported",
  );
}

function testInvalidNodeType(): void {
  const graph = {
    nodes: [
      {
        ...node("angular"),
        type: "invalid",
      },
    ],

    edges: [],
  } as unknown as KnowledgeGraph;

  const report = validator.validate(graph);

  assert(!report.valid, "invalid node type should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "INVALID_NODE_TYPE"),
    "invalid node type should be reported",
  );
}

function testOrphanSource(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("typescript", "TypeScript")],

    edges: [edge("angular-uses-typescript", "angular", "typescript")],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "orphan source should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "ORPHAN_EDGE_SOURCE"),
    "orphan source should be reported",
  );
}

function testOrphanTarget(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular", "Angular")],

    edges: [edge("angular-uses-qdrant", "angular", "qdrant")],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "orphan target should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "ORPHAN_EDGE_TARGET"),
    "orphan target should be reported",
  );
}

function testDuplicateSemanticEdge(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular"), node("typescript")],

    edges: [
      edge("edge-1", "angular", "typescript"),

      edge("edge-2", "angular", "typescript"),
    ],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "duplicate semantic edge should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "DUPLICATE_SEMANTIC_EDGE"),
    "duplicate semantic edge should be reported",
  );
}

function testInvalidConfidence(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular"), node("typescript")],

    edges: [edge("edge-1", "angular", "typescript", "uses", 1.5)],
  };

  const report = validator.validate(graph);

  assert(!report.valid, "invalid confidence should invalidate graph");

  assert(
    report.errors.some((issue) => issue.code === "INVALID_EDGE_CONFIDENCE"),
    "invalid confidence should be reported",
  );
}

function testSelfReferenceWarning(): void {
  const graph: KnowledgeGraph = {
    nodes: [node("angular")],

    edges: [edge("angular-uses-angular", "angular", "angular")],
  };

  const report = validator.validate(graph);

  assert(report.valid, "self-reference should not invalidate graph");

  assert(
    report.warnings.some((issue) => issue.code === "SELF_REFERENCE"),
    "self-reference should generate warning",
  );
}

function run(): void {
  console.log("\n=== Graph Consistency Tests ===\n");

  testValidGraph();
  console.log("✓ valid graph");

  testDuplicateNodeId();
  console.log("✓ duplicate node id");

  testDuplicateLabel();
  console.log("✓ duplicate node label");

  testInvalidNodeType();
  console.log("✓ invalid node type");

  testOrphanSource();
  console.log("✓ orphan source");

  testOrphanTarget();
  console.log("✓ orphan target");

  testDuplicateSemanticEdge();
  console.log("✓ duplicate semantic edge");

  testInvalidConfidence();
  console.log("✓ invalid confidence");

  testSelfReferenceWarning();
  console.log("✓ self-reference warning");

  console.log("\nAll graph consistency tests passed.\n");
}

run();
