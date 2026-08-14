import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export class GraphEvidenceRetriever {
  async search(query: string): Promise<RetrievalResult[]> {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const matches = inferenceRepository.getAll().filter((item) => {
      const text = [item.subject, item.relation, item.object]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => text.includes(token));
    });

    return matches.map((item, index) => ({
      memory: {
        id: `graph-evidence-${index}`,

        text: `${item.subjectLabel} ${item.relation} ${item.objectLabel}`,

        confidence: item.confidence,

        createdAt: new Date().toISOString(),

        metadata: {
          type: "graph-evidence",
          relation: item.relation,
          subject: item.subjectLabel,
          object: item.objectLabel,
        },
      },

      score: item.confidence,

      source: "graph-evidence",
    }));
  }
}
