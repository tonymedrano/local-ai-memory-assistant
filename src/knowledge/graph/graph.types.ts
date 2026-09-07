export type GraphNodeType =
  | "technology"
  | "project"
  | "person"
  | "concept"
  | "skill"
  | "interest";

export type GraphScope = { kind: "tenant"; tenantId: string } | { kind: "system" };

export function tenantGraphScope(tenantId: string): GraphScope {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(tenantId)) throw new Error("Invalid graph tenant id");
  return { kind: "tenant", tenantId };
}

export function graphScopeKey(scope: GraphScope): string {
  return scope.kind === "system" ? "system" : `tenant:${scope.tenantId}`;
}

export function systemGraphScope(): GraphScope { return { kind: "system" }; }

export interface GraphNode {
  id: string;
  scope: GraphScope;

  type: GraphNodeType;

  label: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
}

export interface GraphEdge {
  id: string;
  scope: GraphScope;

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
