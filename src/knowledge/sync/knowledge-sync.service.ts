import { KnowledgeRepository } from "../knowledge.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { toGraphNodeType } from "../mappers/knowledge-graph.mapper.js";

import { GraphConsistencyService } from "../graph/consistency/graph.consistency.js";

import type { KnowledgeItem } from "../knowledge.types.js";
import type { GraphNode } from "../graph/graph.types.js";
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
     * Garantizamos que todos los KnowledgeItems
     * tengan su correspondiente GraphNode.
     *
     * La identidad del GraphNode se resuelve mediante
     * GraphRepository.addNode(), que utiliza la identidad
     * semántica del label.
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
          knowledgeId: item.id,
        },
      };

      const existing = this.graphRepository.findByIdentity(item.subject);

      if (existing) {
        this.graphRepository.updateNode(existing.id, {
          ...node,
          id: existing.id,
          label: existing.label,
        });

        console.log(
          `[KnowledgeSync] Updated ${item.subject} ` + `(${existing.id})`,
        );

        continue;
      }

      const created = this.graphRepository.addNode(node);

      console.log(
        `[KnowledgeSync] Created ${item.subject} ` + `(${created.id})`,
      );
    }

    /*
     * FASE 2
     *
     * Ahora que todos los nodos existen, resolvemos
     * source/target mediante identidad semántica.
     */
    for (const item of knowledge) {
      this.syncRelations(item);
    }

    /*
     * FASE 3
     *
     * Validamos la consistencia del grafo después
     * de completar la sincronización.
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
      const sourceNode = this.graphRepository.resolveNode(relation.source);

      const targetNode = this.graphRepository.resolveNode(relation.target);

      if (!sourceNode || !targetNode) {
        console.log(
          `[KnowledgeSync] Skipping relation ` +
            `${relation.source} --${relation.relation}--> ` +
            `${relation.target}: node not found`,
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
          `${relation.source} --${relation.relation}--> ` +
          `${relation.target}`,
      );
    }
  }
}
