import type { GraphNode, GraphEdge, KnowledgeGraph } from "./graph.types.js";
import { graphStorage } from "./graph.storage.js";

import {
  canonicalizeLabel,
  createNodeId,
} from "./identity/identity.resolver.js";

export class GraphRepository {
  private graph: KnowledgeGraph = graphStorage.load();

  constructor() {
    this.graph = graphStorage.load();

    console.log(
      "[GraphRepository] Loaded",
      this.graph.nodes.length,
      "nodes",
      this.graph.edges.length,
      "edges",
    );
  }

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  addNode(node: GraphNode): GraphNode {
    const existingById = this.graph.nodes.find(
      (existing) => existing.id === node.id,
    );

    if (existingById) {
      return existingById;
    }

    const existingByIdentity = this.findByIdentity(node.label);

    if (existingByIdentity) {
      return existingByIdentity;
    }

    const canonicalLabel = canonicalizeLabel(node.label);

    const normalizedNode: GraphNode = {
      ...node,
      id: createNodeId(canonicalLabel),
      label: canonicalLabel,
    };

    this.graph.nodes.push(normalizedNode);

    graphStorage.save(this.graph);

    return normalizedNode;
  }

  addEdge(edge: GraphEdge) {
    const exists = this.graph.edges.some((e) => e.id === edge.id);

    if (!exists) {
      this.graph.edges.push(edge);

      graphStorage.save(this.graph);
    }
  }

  getNode(id: string) {
    return this.graph.nodes.find((n) => n.id === id);
  }

  getNeighbors(id: string) {
    const targets = this.graph.edges
      .filter((e) => e.source === id)
      .map((e) => e.target);

    return this.graph.nodes.filter((n) => targets.includes(n.id));
  }

  findByLabel(label: string) {
    return this.graph.nodes.find(
      (node) => node.label.toLowerCase() === label.toLowerCase(),
    );
  }

  findAllByLabel(label: string): GraphNode[] {
    return this.graph.nodes.filter(
      (node) => node.label.toLowerCase() === label.toLowerCase(),
    );
  }

  getEdgesFrom(nodeId: string) {
    return this.graph.edges.filter((edge) => edge.source === nodeId);
  }

  getEdgesTo(nodeId: string) {
    return this.graph.edges.filter((edge) => edge.target === nodeId);
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

  findByIdentity(label: string): GraphNode | undefined {
    const canonicalLabel = canonicalizeLabel(label);

    return this.graph.nodes.find(
      (node) => canonicalizeLabel(node.label) === canonicalLabel,
    );
  }

  resolveNode(label: string): GraphNode | undefined {
    return this.findByIdentity(label);
  }

  updateNode(id: string, changes: Partial<GraphNode>) {
    const index = this.graph.nodes.findIndex((node) => node.id === id);

    if (index === -1) {
      return null;
    }

    this.graph.nodes[index] = {
      ...this.graph.nodes[index],
      ...changes,
    };

    graphStorage.save(this.graph);

    return this.graph.nodes[index];
  }

  replaceNodeId(oldId: string, newId: string) {
    const node = this.graph.nodes.find((n) => n.id === oldId);

    if (!node) {
      return;
    }

    // mover identidad del nodo
    node.id = newId;

    // actualizar relaciones
    for (const edge of this.graph.edges) {
      if (edge.source === oldId) {
        edge.source = newId;
      }

      if (edge.target === oldId) {
        edge.target = newId;
      }
    }

    graphStorage.save(this.graph);
  }

  removeDuplicateLabels(keepId: string) {
    const keepNode = this.graph.nodes.find((n) => n.id === keepId);

    if (!keepNode) {
      return;
    }

    const duplicates = this.graph.nodes.filter(
      (n) =>
        n.label.toLowerCase() === keepNode.label.toLowerCase() &&
        n.id !== keepId,
    );

    for (const duplicate of duplicates) {
      console.log(`[GraphRepository] Removing duplicate ${duplicate.id}`);

      // mover edges al nodo bueno
      for (const edge of this.graph.edges) {
        if (edge.source === duplicate.id) {
          edge.source = keepId;
        }

        if (edge.target === duplicate.id) {
          edge.target = keepId;
        }
      }

      this.graph.nodes = this.graph.nodes.filter((n) => n.id !== duplicate.id);
    }

    graphStorage.save(this.graph);
  }

  clear() {
    this.graph = {
      nodes: [],
      edges: [],
    };

    graphStorage.save(this.graph);
  }
}

export const graphRepository = new GraphRepository();
