import { getGraph } from "../graph/graph.service.js";

export interface GraphPath {
  nodes: string[];

  edges: {
    id: string;
    confidence: number;
  }[];
}

export function findTwoHopPaths(): GraphPath[] {
  const graph = getGraph();

  const paths: GraphPath[] = [];

  for (const first of graph.edges) {
    for (const second of graph.edges) {
      if (first.target === second.source && first.source !== second.target) {
        paths.push({
          nodes: [first.source, first.target, second.target],

          edges: [
            {
              id: first.id,
              confidence: first.confidence,
            },
            {
              id: second.id,
              confidence: second.confidence,
            },
          ],
        });
      }
    }
  }

  return paths;
}
