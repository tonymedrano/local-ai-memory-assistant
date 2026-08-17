import { KnowledgeRepository } from "../knowledge.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { toGraphNodeType } from "../mappers/knowledge-graph.mapper.js";

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

    console.log(`[KnowledgeSync] Syncing ${knowledge.length} knowledge items`);

    /*
     * FASE 1
     *
     * Primero garantizamos que todos los KnowledgeItems
     * tengan su correspondiente GraphNode.
     */
    for (const item of knowledge) {
      if (!item.id) {
        continue;
      }

      const node = {
        id: item.id,
        label: item.subject,
        type: toGraphNodeType(item.type),
        createdAt: new Date(item.createdAt).toISOString(),

        metadata: {
          confidence: item.confidence,
          content: item.content,
        },
      };

      const existing = this.graphRepository.getNode(item.id);

      if (existing) {
        this.graphRepository.updateNode(item.id, node);

        console.log(`[KnowledgeSync] Updated ${item.subject}`);

        this.graphRepository.removeDuplicateLabels(item.id);

        continue;
      }

      const candidates = this.graphRepository.findAllByLabel(item.subject);

      const byLabel = candidates.find((candidate) => candidate.id !== item.id);

      if (byLabel) {
        console.log(`[KnowledgeSync] Migrating ${byLabel.id} -> ${item.id}`);

        this.graphRepository.replaceNodeId(byLabel.id, item.id);

        this.graphRepository.updateNode(item.id, node);

        this.graphRepository.removeDuplicateLabels(item.id);

        continue;
      }

      this.graphRepository.addNode(node);

      console.log(`[KnowledgeSync] Created ${item.subject}`);
    }

    /*
     * FASE 2
     *
     * Ahora que todos los nodos existen, podemos resolver
     * source/target de las relaciones.
     */
    for (const item of knowledge) {
      this.syncRelations(item);
    }

    /*
     * FASE 3
     *
     * Validamos la consistencia estructural del grafo
     * después de completar la sincronización.
     *
     * Esta fase NO realiza auto-repair.
     */
    const graph = this.graphRepository.getGraph();

    const report = this.consistencyService.validate(graph);

    console.log(
      `[KnowledgeSync] Graph consistency: ${
        report.valid ? "VALID" : "INVALID"
      }`,
    );

    if (report.errors.length > 0) {
      console.error("[KnowledgeSync] Consistency errors:", report.errors);
    }

    if (report.warnings.length > 0) {
      console.warn("[KnowledgeSync] Consistency warnings:", report.warnings);
    }

    console.log(
      `[KnowledgeSync] Graph stats: ` +
        `${report.stats.nodes} nodes, ` +
        `${report.stats.edges} edges, ` +
        `${report.errors.length} errors, ` +
        `${report.warnings.length} warnings`,
    );

    console.log("[KnowledgeSync] Complete");

    return report;
  }

  private syncRelations(item: KnowledgeItem): void {
    if (!item.id) {
      return;
    }

    for (const relation of item.relations ?? []) {
      const sourceNode = this.graphRepository.findByLabel(relation.source);

      const targetNode = this.graphRepository.findByLabel(relation.target);

      if (!sourceNode || !targetNode) {
        console.log(
          `[KnowledgeSync] Skipping relation ` +
            `${relation.source} --${relation.relation}--> ${relation.target}: ` +
            `node not found`,
        );

        continue;
      }

      const existing = this.graphRepository.findEdge(
        sourceNode.id,
        relation.relation,
        targetNode.id,
      );

      if (existing) {
        continue;
      }

      const edgeId = [sourceNode.id, relation.relation, targetNode.id].join(
        ":",
      );

      this.graphRepository.addEdge({
        id: edgeId,

        source: sourceNode.id,

        target: targetNode.id,

        relation: relation.relation,

        confidence: item.confidence,

        createdAt: new Date(item.createdAt).toISOString(),
      });

      console.log(
        `[KnowledgeSync] Created edge ` +
          `${relation.source} --${relation.relation}--> ${relation.target}`,
      );
    }
  }
}
