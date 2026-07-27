import { graphRepository } from "./graph.repository.js";

export function getGraph() {
  return graphRepository.getGraph();
}

export function getNode(id: string) {
  return graphRepository.getNode(id);
}

export function getNeighbors(id: string) {
  return graphRepository.getNeighbors(id);
}

export function getStats() {
  const graph = graphRepository.getGraph();

  return {
    nodes: graph.nodes.length,

    edges: graph.edges.length,

    isolatedNodes: graph.nodes.filter(
      (node) =>
        !graph.edges.some((e) => e.source === node.id || e.target === node.id),
    ).length,
  };
}

export function findByLabel(label: string) {
  return graphRepository.findByLabel(label);
}

export function getRelations(id: string) {
  const edges = graphRepository.getEdgesFrom(id);

  return edges.map((edge) => ({
    relation: edge.relation,
    target: edge.target,
  }));
}
