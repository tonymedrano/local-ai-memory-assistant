import { graphRepository } from "../../knowledge/graph/graph.repository.js";
import { graphScopeKey, type GraphNode, type GraphScope } from "../../knowledge/graph/graph.types.js";

export interface TraversedStep {
  nodeId: string;
  label: string;
  relation?: string;
  confidence?: number;
}

export interface TraversedNode {
  node: GraphNode;
  distance: number;
  path: TraversedStep[];
  score: number;
}

interface QueueItem {
  node: GraphNode;
  distance: number;
  path: TraversedStep[];
}

export class GraphTraverser {
  constructor(private readonly repository = graphRepository) {}

  traverse(scope: GraphScope, entities: string[], maxDepth = 2): TraversedNode[] {
    const visited = new Set<string>();
    const queue: QueueItem[] = [];
    const results: TraversedNode[] = [];

    // Nodos iniciales
    for (const entity of entities) {
      const node = this.repository.findByLabel(scope, entity);
      const nodes = node && graphScopeKey(node.scope) === graphScopeKey(scope) ? [node] : [];

      for (const node of nodes) {
        queue.push({
          node,
          distance: 0,
          path: [
            {
              nodeId: node.id,
              label: node.label,
            },
          ],
        });
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current.node.id)) {
        continue;
      }

      visited.add(current.node.id);

      results.push({
        node: current.node,
        distance: current.distance,
        path: current.path,
        score: 1 / (current.distance + 1),
      });

      if (current.distance >= maxDepth) {
        continue;
      }

      if (graphScopeKey(current.node.scope) !== graphScopeKey(scope)) continue;
      const edges = this.repository.getEdgesFrom(scope, current.node.id)
        .filter((edge) => graphScopeKey(edge.scope) === graphScopeKey(scope));

      for (const edge of edges) {
        const neighbor = this.repository.getNode(scope, edge.target);

        if (!neighbor || graphScopeKey(neighbor.scope) !== graphScopeKey(scope) || visited.has(neighbor.id)) {
          continue;
        }

        queue.push({
          node: neighbor,
          distance: current.distance + 1,
          path: [
            ...current.path,
            {
              nodeId: neighbor.id,
              label: neighbor.label,
              relation: edge.relation,
              confidence: edge.confidence,
            },
          ],
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
