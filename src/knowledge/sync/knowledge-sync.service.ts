import { KnowledgeRepository } from "../knowledge.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { toGraphNodeType } from "../mappers/knowledge-graph.mapper.js";

export class KnowledgeSyncService {
  constructor(
    private readonly knowledgeRepository = new KnowledgeRepository(),
    private readonly graphRepository = new GraphRepository(),
  ) {}

  async sync(): Promise<void> {
    const knowledge = await this.knowledgeRepository.findAll();

    console.log(`[KnowledgeSync] Syncing ${knowledge.length} knowledge items`);

    for (const item of knowledge) {
      const node = {
        id: item.id!,
        label: item.subject,
        type: toGraphNodeType(item.type),
        createdAt: new Date(item.createdAt).toISOString(),

        metadata: {
          confidence: item.confidence,
          content: item.content,
        },
      };

      if (!item.id) {
        continue;
      }

      const existing = this.graphRepository.getNode(item.id);

      if (existing) {
        this.graphRepository.updateNode(item.id, node);

        console.log(`[KnowledgeSync] Updated ${item.subject}`);
        this.graphRepository.removeDuplicateLabels(item.id);
      } else {
        const candidates = this.graphRepository.findAllByLabel(item.subject);

        const byLabel = candidates.find((node) => node.id !== item.id);

        if (byLabel && byLabel.id !== item.id) {
          console.log(`[KnowledgeSync] Migrating ${byLabel.id} -> ${item.id}`);

          this.graphRepository.replaceNodeId(byLabel.id, item.id);

          this.graphRepository.updateNode(item.id, node);
        } else {
          this.graphRepository.addNode(node);

          console.log(`[KnowledgeSync] Created ${item.subject}`);
        }
      }
    }

    console.log("[KnowledgeSync] Complete");
  }
}
