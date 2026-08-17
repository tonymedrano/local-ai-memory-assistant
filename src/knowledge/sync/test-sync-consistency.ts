import { KnowledgeSyncService } from "./knowledge-sync.service.js";

import type { KnowledgeItem } from "../knowledge.types.js";

import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
} from "../graph/graph.types.js";

class TestKnowledgeRepository {
  constructor(private readonly items: KnowledgeItem[]) {}

  async findAll(): Promise<KnowledgeItem[]> {
    return this.items;
  }
}

class TestGraphRepository {
  private graph: KnowledgeGraph = {
    nodes: [],
    edges: [],
  };

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  addNode(node: GraphNode): void {
    const exists = this.graph.nodes.some((current) => current.id === node.id);

    if (!exists) {
      this.graph.nodes.push(node);
    }
  }

  addEdge(edge: GraphEdge): void {
    const exists = this.graph.edges.some((current) => current.id === edge.id);

    if (!exists) {
      this.graph.edges.push(edge);
    }
  }

  getNode(id: string): GraphNode | undefined {
    return this.graph.nodes.find((node) => node.id === id);
  }

  updateNode(id: string, changes: Partial<GraphNode>): GraphNode | null {
    const index = this.graph.nodes.findIndex((node) => node.id === id);

    if (index === -1) {
      return null;
    }

    this.graph.nodes[index] = {
      ...this.graph.nodes[index],
      ...changes,
    };

    return this.graph.nodes[index];
  }

  findAllByLabel(label: string): GraphNode[] {
    return this.graph.nodes.filter(
      (node) => node.label.toLowerCase() === label.toLowerCase(),
    );
  }

  findByLabel(label: string): GraphNode | undefined {
    return this.graph.nodes.find(
      (node) => node.label.toLowerCase() === label.toLowerCase(),
    );
  }

  findEdge(
    source: string,
    relation: string,
    target: string,
  ): GraphEdge | undefined {
    return this.graph.edges.find(
      (edge) =>
        edge.source === source &&
        edge.relation === relation &&
        edge.target === target,
    );
  }

  replaceNodeId(oldId: string, newId: string): void {
    const node = this.graph.nodes.find((current) => current.id === oldId);

    if (!node) {
      return;
    }

    node.id = newId;

    for (const edge of this.graph.edges) {
      if (edge.source === oldId) {
        edge.source = newId;
      }

      if (edge.target === oldId) {
        edge.target = newId;
      }
    }
  }

  removeDuplicateLabels(keepId: string): void {
    const keepNode = this.graph.nodes.find((node) => node.id === keepId);

    if (!keepNode) {
      return;
    }

    const duplicates = this.graph.nodes.filter(
      (node) =>
        node.label.toLowerCase() === keepNode.label.toLowerCase() &&
        node.id !== keepId,
    );

    for (const duplicate of duplicates) {
      for (const edge of this.graph.edges) {
        if (edge.source === duplicate.id) {
          edge.source = keepId;
        }

        if (edge.target === duplicate.id) {
          edge.target = keepId;
        }
      }

      this.graph.nodes = this.graph.nodes.filter(
        (node) => node.id !== duplicate.id,
      );
    }
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function snapshot(graph: KnowledgeGraph): string {
  return JSON.stringify(graph, null, 2);
}

async function testSyncProducesValidGraph(): Promise<void> {
  const items: KnowledgeItem[] = [
    {
      id: "angular-id",

      type: "technology",

      subject: "Angular",

      content: "Frontend framework",

      relations: [
        {
          source: "Angular",
          relation: "uses",
          target: "TypeScript",
        },
      ],

      confidence: 0.9,

      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    },

    {
      id: "typescript-id",

      type: "technology",

      subject: "TypeScript",

      content: "Programming language",

      relations: [],

      confidence: 0.95,

      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    },
  ];

  const knowledgeRepository = new TestKnowledgeRepository(items);

  const graphRepository = new TestGraphRepository();

  const service = new KnowledgeSyncService(
    knowledgeRepository as any,
    graphRepository as any,
  );

  const report = await service.sync();

  assert(report.valid, "sync should produce a valid graph");

  assert(
    report.errors.length === 0,
    "sync should produce zero consistency errors",
  );

  assert(
    graphRepository.getGraph().nodes.length === 2,
    "graph should contain two nodes",
  );

  assert(
    graphRepository.getGraph().edges.length === 1,
    "graph should contain one edge",
  );
}

async function testSyncIsIdempotent(): Promise<void> {
  const items: KnowledgeItem[] = [
    {
      id: "angular-id",

      type: "technology",

      subject: "Angular",

      content: "Frontend framework",

      relations: [
        {
          source: "Angular",
          relation: "uses",
          target: "TypeScript",
        },
      ],

      confidence: 0.9,

      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    },

    {
      id: "typescript-id",

      type: "technology",

      subject: "TypeScript",

      content: "Programming language",

      relations: [],

      confidence: 0.95,

      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    },
  ];

  const knowledgeRepository = new TestKnowledgeRepository(items);

  const graphRepository = new TestGraphRepository();

  const service = new KnowledgeSyncService(
    knowledgeRepository as any,
    graphRepository as any,
  );

  const firstReport = await service.sync();

  assert(firstReport.valid, "first sync should be valid");

  const firstSnapshot = snapshot(graphRepository.getGraph());

  const firstNodeCount = graphRepository.getGraph().nodes.length;

  const firstEdgeCount = graphRepository.getGraph().edges.length;

  const secondReport = await service.sync();

  assert(secondReport.valid, "second sync should be valid");

  const secondSnapshot = snapshot(graphRepository.getGraph());

  assert(
    firstNodeCount === graphRepository.getGraph().nodes.length,
    "second sync must not add nodes",
  );

  assert(
    firstEdgeCount === graphRepository.getGraph().edges.length,
    "second sync must not add edges",
  );

  assert(firstSnapshot === secondSnapshot, "sync must be idempotent");
}

async function run(): Promise<void> {
  console.log("\n=== Knowledge Sync Consistency ===\n");

  await testSyncProducesValidGraph();

  console.log("✓ sync produces valid graph");

  await testSyncIsIdempotent();

  console.log("✓ sync is idempotent");

  console.log("\nAll sync consistency tests passed.\n");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
