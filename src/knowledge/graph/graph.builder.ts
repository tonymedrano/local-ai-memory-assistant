import { graphRepository } from "./graph.repository.js";

import type { GraphNode, GraphEdge } from "./graph.types.js";

function createId(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function buildKnowledgeGraph(memories: any[]) {
  for (const memory of memories) {
    const nodeId = createId(memory.subject);

    const node: GraphNode = {
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
      const targetId = createId(relation.target);

      graphRepository.addNode({
        id: targetId,

        type: "concept",

        label: relation.target,

        createdAt: memory.createdAt,
      });

      const edge: GraphEdge = {
        id: `${nodeId}-${relation.type}-${targetId}`,

        source: nodeId,

        target: targetId,

        relation: relation.type,

        confidence: memory.confidence ?? 0.5,

        createdAt: memory.createdAt,
      };

      graphRepository.addEdge(edge);
    }
  }

  return graphRepository.getGraph();
}
