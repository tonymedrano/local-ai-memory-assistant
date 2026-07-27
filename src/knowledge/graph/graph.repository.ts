import type { GraphNode, GraphEdge, KnowledgeGraph } from "./graph.types.js";
import { graphStorage } from "./graph.storage.js";

class GraphRepository {
  private graph: KnowledgeGraph = graphStorage.load();

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  addNode(node: GraphNode) {
    const exists = this.graph.nodes.some((n) => n.id === node.id);

    if (!exists) {
      this.graph.nodes.push(node);

      graphStorage.save(this.graph);
    }
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

  getEdgesFrom(nodeId: string) {
    return this.graph.edges.filter((edge) => edge.source === nodeId);
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
