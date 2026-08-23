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

  addNode(node: GraphNode): GraphNode {
    const existingById = this.graph.nodes.find(
      (current) => current.id === node.id,
    );

    if (existingById) {
      return existingById;
    }

    const existingByIdentity = this.findByIdentity(node.label);

    if (existingByIdentity) {
      return existingByIdentity;
    }

    this.graph.nodes.push(node);

    return node;
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

  findByIdentity(label: string): GraphNode | undefined {
    const canonical = label.trim().toLowerCase();

    return this.graph.nodes.find(
      (node) => node.label.trim().toLowerCase() === canonical,
    );
  }

  resolveNode(label: string): GraphNode | undefined {
    return this.findByIdentity(label);
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
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function testSemanticIdentityReuse(): Promise<void> {
  const items: KnowledgeItem[] = [
    {
      id: "angular-memory-001",
      type: "technology",
      subject: "Angular",
      content: "Frontend framework",
      relations: [],
      confidence: 0.9,
      createdAt: new Date("2026-08-17T10:00:00.000Z"),
    },

    {
      id: "angular-memory-002",
      type: "technology",
      subject: "angular",
      content: "Frontend framework",
      relations: [],
      confidence: 0.95,
      createdAt: new Date("2026-08-17T11:00:00.000Z"),
    },
  ];

  const knowledgeRepository = new TestKnowledgeRepository(items);

  const graphRepository = new TestGraphRepository();

  const service = new KnowledgeSyncService(
    knowledgeRepository as any,
    graphRepository as any,
  );

  const report = await service.sync();

  assert(report.valid, "semantic identity reuse should produce a valid graph");

  assert(
    graphRepository.getGraph().nodes.length === 1,
    "semantically identical subjects must produce one node",
  );

  const node = graphRepository.getGraph().nodes[0];

  assert(
    node.id === "angular-memory-001",
    "existing graph identity must be preserved",
  );

  assert(
    node.label === "Angular",
    "existing canonical graph label must be preserved",
  );
}

async function run(): Promise<void> {
  console.log("\n=== Knowledge Sync Semantic Identity ===\n");

  await testSemanticIdentityReuse();

  console.log("✓ semantic identity is reused");

  console.log("\nAll semantic identity tests passed.\n");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
