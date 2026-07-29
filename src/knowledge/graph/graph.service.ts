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

  return edges.map((edge) => {
    const target = graphRepository.getNode(edge.target);

    return {
      relation: edge.relation,

      target: target?.label ?? edge.target,

      confidence: edge.confidence,
    };
  });
}

export function findNodeByLabel(label: string) {
  return graphRepository.findByLabel(label);
}

export function getIncomingRelations(id: string) {
  const edges = graphRepository.getEdgesTo(id);

  return edges.map((edge) => {
    const source = graphRepository.getNode(edge.source);

    return {
      relation: edge.relation,

      source: source?.label ?? edge.source,

      confidence: edge.confidence,
    };
  });
}
