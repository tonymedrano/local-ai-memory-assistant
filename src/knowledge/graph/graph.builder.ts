import { graphRepository } from "./graph.repository.js";

import type { GraphNode, GraphEdge, GraphScope } from "./graph.types.js";
import { resolveGraphEdgeId, resolveGraphNodeId } from "./identity/identity.resolver.js";

export function buildKnowledgeGraph(scope: GraphScope, memories: any[]) {
  for (const memory of memories) {
    const nodeId = resolveGraphNodeId(scope, memory.subject);

    const node: GraphNode = {
      scope,
      id: nodeId,

      type: memory.type ?? "concept",

      label: memory.subject,

      metadata: {
        content: memory.content,
      },

      createdAt: memory.createdAt,
    };

    graphRepository.addNode(node);

    for (const relation of memory.relations ?? []) {
      const targetId = resolveGraphNodeId(scope, relation.target);

      graphRepository.addNode({
        scope,
        id: targetId,

        type: "concept",

        label: relation.target,

        createdAt: memory.createdAt,
      });

      const edge: GraphEdge = {
        scope: { kind: "system" },
        id: resolveGraphEdgeId(scope, nodeId, relation.type, targetId),

        source: nodeId,

        target: targetId,

        relation: relation.type,

        confidence: memory.confidence ?? 0.5,

        createdAt: memory.createdAt,
      };

      graphRepository.addEdge(scope, edge);
    }
  }

  return graphRepository.getGraph(scope);
}
