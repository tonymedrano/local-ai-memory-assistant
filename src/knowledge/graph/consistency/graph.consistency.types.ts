import type { KnowledgeGraph } from "../graph.types.js";

export type GraphConsistencySeverity = "error" | "warning";

export type GraphConsistencyIssueCode =
  | "DUPLICATE_NODE_ID"
  | "DUPLICATE_EDGE_ID"
  | "DUPLICATE_NODE_LABEL"
  | "INVALID_NODE_TYPE"
  | "EMPTY_NODE_LABEL"
  | "INVALID_NODE_TIMESTAMP"
  | "ORPHAN_EDGE_SOURCE"
  | "ORPHAN_EDGE_TARGET"
  | "EMPTY_EDGE_RELATION"
  | "INVALID_EDGE_CONFIDENCE"
  | "INVALID_EDGE_TIMESTAMP"
  | "DUPLICATE_SEMANTIC_EDGE"
  | "SELF_REFERENCE";

export interface GraphConsistencyIssue {
  severity: GraphConsistencySeverity;

  code: GraphConsistencyIssueCode;

  message: string;

  nodeId?: string;

  edgeId?: string;
}

export interface GraphConsistencyStats {
  nodes: number;

  edges: number;

  duplicateNodeIds: number;

  duplicateEdgeIds: number;

  duplicateNodeLabels: number;

  orphanEdges: number;

  duplicateSemanticEdges: number;
}

export interface GraphConsistencyReport {
  valid: boolean;

  errors: GraphConsistencyIssue[];

  warnings: GraphConsistencyIssue[];

  stats: GraphConsistencyStats;
}

export interface GraphConsistencyValidator {
  validate(graph: KnowledgeGraph): GraphConsistencyReport;
}
