import type {
  GraphEdge,
  GraphNode,
  GraphNodeType,
  KnowledgeGraph,
} from "../graph.types.js";

import type {
  GraphConsistencyIssue,
  GraphConsistencyReport,
  GraphConsistencyStats,
  GraphConsistencyValidator,
} from "./graph.consistency.types.js";

const VALID_NODE_TYPES: ReadonlySet<GraphNodeType> = new Set([
  "technology",
  "project",
  "person",
  "concept",
  "skill",
  "interest",
]);

function isValidTimestamp(value: string): boolean {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  const timestamp = Date.parse(value);

  return !Number.isNaN(timestamp);
}

function normalizeLabel(label: string): string {
  return label.toLowerCase();
}

function semanticEdgeKey(edge: GraphEdge): string {
  return [edge.source, edge.relation, edge.target].join("::");
}

export class GraphConsistencyService implements GraphConsistencyValidator {
  validate(graph: KnowledgeGraph): GraphConsistencyReport {
    const errors: GraphConsistencyIssue[] = [];
    const warnings: GraphConsistencyIssue[] = [];

    const stats: GraphConsistencyStats = {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      duplicateNodeIds: 0,
      duplicateEdgeIds: 0,
      duplicateNodeLabels: 0,
      orphanEdges: 0,
      duplicateSemanticEdges: 0,
    };

    this.validateNodes(graph.nodes, errors, stats);

    this.validateEdges(graph, errors, warnings, stats);

    return {
      valid: errors.length === 0,

      errors,

      warnings,

      stats,
    };
  }

  private validateNodes(
    nodes: GraphNode[],
    errors: GraphConsistencyIssue[],
    stats: GraphConsistencyStats,
  ): void {
    const nodeIds = new Set<string>();

    const labels = new Map<string, GraphNode>();

    for (const node of nodes) {
      this.validateNode(node, errors);

      if (nodeIds.has(node.id)) {
        stats.duplicateNodeIds++;

        errors.push({
          severity: "error",
          code: "DUPLICATE_NODE_ID",
          message: `Duplicate node id "${node.id}".`,
          nodeId: node.id,
        });
      } else {
        nodeIds.add(node.id);
      }

      const normalizedLabel = normalizeLabel(node.label);

      const existing = labels.get(normalizedLabel);

      if (existing && existing.id !== node.id) {
        stats.duplicateNodeLabels++;

        errors.push({
          severity: "error",
          code: "DUPLICATE_NODE_LABEL",
          message:
            `Duplicate node label "${node.label}" ` +
            `used by nodes "${existing.id}" and "${node.id}".`,

          nodeId: node.id,
        });
      } else {
        labels.set(normalizedLabel, node);
      }
    }
  }

  private validateNode(node: GraphNode, errors: GraphConsistencyIssue[]): void {
    if (!node.id || node.id.trim().length === 0) {
      errors.push({
        severity: "error",
        code: "DUPLICATE_NODE_ID",
        message: "Node has an empty id.",
      });
    }

    if (!VALID_NODE_TYPES.has(node.type)) {
      errors.push({
        severity: "error",
        code: "INVALID_NODE_TYPE",
        message: `Node "${node.id}" has invalid type "${node.type}".`,
        nodeId: node.id,
      });
    }

    if (typeof node.label !== "string" || node.label.trim().length === 0) {
      errors.push({
        severity: "error",
        code: "EMPTY_NODE_LABEL",
        message: `Node "${node.id}" has an empty label.`,
        nodeId: node.id,
      });
    }

    if (!isValidTimestamp(node.createdAt)) {
      errors.push({
        severity: "error",
        code: "INVALID_NODE_TIMESTAMP",
        message: `Node "${node.id}" has an invalid createdAt timestamp.`,
        nodeId: node.id,
      });
    }
  }

  private validateEdges(
    graph: KnowledgeGraph,
    errors: GraphConsistencyIssue[],
    warnings: GraphConsistencyIssue[],
    stats: GraphConsistencyStats,
  ): void {
    const nodeIds = new Set(graph.nodes.map((node) => node.id));

    const edgeIds = new Set<string>();

    const semanticEdges = new Set<string>();

    for (const edge of graph.edges) {
      this.validateEdge(edge, nodeIds, errors, warnings, stats);

      if (edgeIds.has(edge.id)) {
        stats.duplicateEdgeIds++;

        errors.push({
          severity: "error",
          code: "DUPLICATE_EDGE_ID",
          message: `Duplicate edge id "${edge.id}".`,
          edgeId: edge.id,
        });
      } else {
        edgeIds.add(edge.id);
      }

      const semanticKey = semanticEdgeKey(edge);

      if (semanticEdges.has(semanticKey)) {
        stats.duplicateSemanticEdges++;

        errors.push({
          severity: "error",
          code: "DUPLICATE_SEMANTIC_EDGE",
          message:
            `Duplicate semantic edge ` +
            `"${edge.source}" --${edge.relation}--> "${edge.target}".`,
          edgeId: edge.id,
        });
      } else {
        semanticEdges.add(semanticKey);
      }
    }
  }

  private validateEdge(
    edge: GraphEdge,
    nodeIds: Set<string>,
    errors: GraphConsistencyIssue[],
    warnings: GraphConsistencyIssue[],
    stats: GraphConsistencyStats,
  ): void {
    let orphan = false;

    if (!nodeIds.has(edge.source)) {
      orphan = true;

      errors.push({
        severity: "error",
        code: "ORPHAN_EDGE_SOURCE",
        message:
          `Edge "${edge.id}" references missing ` +
          `source node "${edge.source}".`,
        edgeId: edge.id,
      });
    }

    if (!nodeIds.has(edge.target)) {
      orphan = true;

      errors.push({
        severity: "error",
        code: "ORPHAN_EDGE_TARGET",
        message:
          `Edge "${edge.id}" references missing ` +
          `target node "${edge.target}".`,
        edgeId: edge.id,
      });
    }

    if (orphan) {
      stats.orphanEdges++;
    }

    if (
      typeof edge.relation !== "string" ||
      edge.relation.trim().length === 0
    ) {
      errors.push({
        severity: "error",
        code: "EMPTY_EDGE_RELATION",
        message: `Edge "${edge.id}" has an empty relation.`,
        edgeId: edge.id,
      });
    }

    if (
      !Number.isFinite(edge.confidence) ||
      edge.confidence < 0 ||
      edge.confidence > 1
    ) {
      errors.push({
        severity: "error",
        code: "INVALID_EDGE_CONFIDENCE",
        message:
          `Edge "${edge.id}" has invalid confidence ` + `"${edge.confidence}".`,
        edgeId: edge.id,
      });
    }

    if (!isValidTimestamp(edge.createdAt)) {
      errors.push({
        severity: "error",
        code: "INVALID_EDGE_TIMESTAMP",
        message: `Edge "${edge.id}" has an invalid createdAt timestamp.`,
        edgeId: edge.id,
      });
    }

    if (edge.source === edge.target && nodeIds.has(edge.source)) {
      warnings.push({
        severity: "warning",
        code: "SELF_REFERENCE",
        message:
          `Edge "${edge.id}" is a self-reference ` +
          `on node "${edge.source}".`,
        edgeId: edge.id,
      });
    }
  }
}
