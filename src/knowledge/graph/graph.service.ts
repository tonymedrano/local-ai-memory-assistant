import { graphRepository } from "./graph.repository.js";
import type { GraphScope } from "./graph.types.js";

export function getGraph(scope: GraphScope) {
  return graphRepository.getGraph(scope);
}

export function getNode(scope: GraphScope, id: string) {
  return graphRepository.getNode(scope, id);
}

export function getNeighbors(scope: GraphScope, id: string) {
  return graphRepository.getNeighbors(scope, id);
}

export function getStats(scope: GraphScope) {
  const graph = graphRepository.getGraph(scope);

  return {
    nodes: graph.nodes.length,

    edges: graph.edges.length,

    isolatedNodes: graph.nodes.filter(
      (node) =>
        !graph.edges.some((e) => e.source === node.id || e.target === node.id),
    ).length,
  };
}

export function findByLabel(scope: GraphScope, label: string) {
  return graphRepository.findByLabel(scope, label);
}

export function getRelations(scope: GraphScope, id: string) {
  const edges = graphRepository.getEdgesFrom(scope, id);

  return edges.map((edge) => {
    const target = graphRepository.getNode(scope, edge.target);

    return {
      relation: edge.relation,

      target: target?.label ?? edge.target,

      confidence: edge.confidence,
    };
  });
}

export function findNodeByLabel(scope: GraphScope, label: string) {
  return graphRepository.findByLabel(scope, label);
}

export function getIncomingRelations(scope: GraphScope, id: string) {
  const edges = graphRepository.getEdgesTo(scope, id);

  return edges.map((edge) => {
    const source = graphRepository.getNode(scope, edge.source);

    return {
      relation: edge.relation,

      source: source?.label ?? edge.source,

      confidence: edge.confidence,
    };
  });
}
