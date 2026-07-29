import type { KnowledgeType } from "../knowledge.types.js";
import type { GraphNodeType } from "../graph/graph.types.js";

const TYPE_MAP: Record<KnowledgeType, GraphNodeType> = {
  fact: "concept",
  decision: "concept",
  architecture: "concept",
  technology: "technology",
  preference: "interest",
};

export function toGraphNodeType(
  type: KnowledgeType,
): GraphNodeType {
  return TYPE_MAP[type];
}