export type GraphNodeType =
  | "technology"
  | "project"
  | "person"
  | "concept"
  | "skill"
  | "interest";

export interface GraphNode {
  id: string;

  type: GraphNodeType;

  label: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
}

export interface GraphEdge {
  id: string;

  source: string;

  target: string;

  relation: string;

  confidence: number;

  createdAt: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];

  edges: GraphEdge[];
}

export interface GraphInputMemory {

    id: string;

    type: string;

    subject: string;

    content: string;

    relations: {
        type: string;
        target: string;
    }[];

    confidence: number;

    createdAt: string;
}