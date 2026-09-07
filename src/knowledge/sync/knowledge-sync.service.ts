import { KnowledgeRepository } from "../knowledge.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { toGraphNodeType } from "../mappers/knowledge-graph.mapper.js";
import { resolveGraphEdgeId, resolveGraphNodeId } from "../graph/identity/identity.resolver.js";
import { tenantGraphScope, type GraphScope, type GraphNode, type GraphEdge } from "../graph/graph.types.js";
import { GraphConsistencyService } from "../graph/consistency/graph.consistency.js";
import type { KnowledgeItem } from "../knowledge.types.js";
import type { GraphConsistencyReport } from "../graph/consistency/graph.consistency.types.js";

export class KnowledgeSyncService {
  constructor(
    private readonly knowledgeRepository = new KnowledgeRepository(),
    private readonly graphRepository = new GraphRepository(),
    private readonly consistencyService = new GraphConsistencyService(),
  ) {}

  async sync(): Promise<GraphConsistencyReport> {
    const knowledge = await this.knowledgeRepository.findAll();
    const invalid = knowledge.find((item) => !item.tenantId || !item.tenantId.trim());
    if (invalid) {
      throw new Error(`Knowledge item ${invalid.id ?? "<unknown>"} has no tenantId; refusing unscoped graph sync`);
    }
    const byTenant = new Map<string, KnowledgeItem[]>();
    for (const item of knowledge) {
      const tenantId = item.tenantId!.trim();
      byTenant.set(tenantId, [...(byTenant.get(tenantId) ?? []), item]);
    }
    return this.mergeReports([...byTenant].map(([tenantId, items]) => this.syncTenant(tenantGraphScope(tenantId), items)));
  }

  private syncTenant(scope: GraphScope, knowledge: KnowledgeItem[]): GraphConsistencyReport {
    for (const item of knowledge) {
      if (!item.id) continue;
      const node: GraphNode = {
        scope,
        id: resolveGraphNodeId(scope, item.subject),
        label: item.subject,
        type: toGraphNodeType(item.type),
        createdAt: new Date(item.createdAt).toISOString(),
        metadata: { confidence: item.confidence, content: item.content, knowledgeId: item.id, tenantId: scope.kind === "tenant" ? scope.tenantId : undefined },
      };
      this.graphRepository.addNode(node);
    }
    for (const item of knowledge) this.syncRelations(scope, item);
    return this.consistencyService.validate(this.graphRepository.getGraph(scope));
  }

  private syncRelations(scope: GraphScope, item: KnowledgeItem): void {
    for (const relation of item.relations ?? []) {
      const sourceNode = this.graphRepository.findByLabel(scope, relation.source);
      const targetNode = this.graphRepository.findByLabel(scope, relation.target);
      if (!sourceNode || !targetNode) continue;
      const edgeId = resolveGraphEdgeId(scope, sourceNode.id, relation.relation, targetNode.id);
      if (this.graphRepository.getEdgesFrom(scope, sourceNode.id).some((edge) => edge.id === edgeId)) continue;
      const edge: GraphEdge = { scope, id: edgeId, source: sourceNode.id, target: targetNode.id, relation: relation.relation, confidence: item.confidence, createdAt: new Date(item.createdAt).toISOString() };
      this.graphRepository.addEdge(scope, edge);
    }
  }

  private mergeReports(reports: GraphConsistencyReport[]): GraphConsistencyReport {
    const stats = reports.reduce((sum, report) => ({
      nodes: sum.nodes + report.stats.nodes, edges: sum.edges + report.stats.edges,
      duplicateNodeIds: sum.duplicateNodeIds + report.stats.duplicateNodeIds,
      duplicateEdgeIds: sum.duplicateEdgeIds + report.stats.duplicateEdgeIds,
      duplicateNodeLabels: sum.duplicateNodeLabels + report.stats.duplicateNodeLabels,
      duplicateSemanticIdentities: sum.duplicateSemanticIdentities + report.stats.duplicateSemanticIdentities,
      orphanEdges: sum.orphanEdges + report.stats.orphanEdges,
      duplicateSemanticEdges: sum.duplicateSemanticEdges + report.stats.duplicateSemanticEdges,
    }), { nodes: 0, edges: 0, duplicateNodeIds: 0, duplicateEdgeIds: 0, duplicateNodeLabels: 0, duplicateSemanticIdentities: 0, orphanEdges: 0, duplicateSemanticEdges: 0 });
    return { valid: reports.every((report) => report.valid), errors: reports.flatMap((report) => report.errors), warnings: reports.flatMap((report) => report.warnings), stats };
  }
}
