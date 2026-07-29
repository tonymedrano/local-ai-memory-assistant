import { getGraph } from "../graph/graph.service.js";

export interface GraphPath {
  nodes: string[];

  edges: {
    id: string;
    relation: string;
    confidence: number;
  }[];
}

export function findTwoHopPaths(): GraphPath[] {
  const graph = getGraph();

  const paths: GraphPath[] = [];

  const allowedRelations = ["uses", "depends_on", "requires"];

  for (const first of graph.edges) {
    if (!allowedRelations.includes(first.relation)) {
      continue;
    }

    for (const second of graph.edges) {
      if (!allowedRelations.includes(second.relation)) {
        continue;
      }

      if (first.target === second.source && first.source !== second.target) {
        paths.push({
          nodes: [first.source, first.target, second.target],

          edges: [
            {
              id: first.id,
              relation: first.relation,
              confidence: first.confidence,
            },

            {
              id: second.id,
              relation: second.relation,
              confidence: second.confidence,
            },
          ],
        });
      }
    }
  }

  return paths;
}
