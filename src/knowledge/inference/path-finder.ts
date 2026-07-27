import { getGraph } from "../graph/graph.service.js";

export interface GraphPath {
  nodes: string[];

  edges: string[];
}

export function findTwoHopPaths(): GraphPath[] {
  const graph = getGraph();

  const paths: GraphPath[] = [];

  for (const first of graph.edges) {
    for (const second of graph.edges) {
      if (first.target === second.source && first.source !== second.target) {
        paths.push({
          nodes: [first.source, first.target, second.target],

          edges: [first.id, second.id],
        });
      }
    }
  }

  return paths;
}
