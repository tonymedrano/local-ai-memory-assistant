import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

export interface GraphEvidenceSearchOptions {
  limit?: number;
}

export class GraphEvidenceRetriever {
  async search(
    query: string,
    options?: GraphEvidenceSearchOptions,
  ): Promise<RetrievalResult[]> {
    if (options?.limit !== undefined && options.limit <= 0) {
      return [];
    }

    const tokens = this.tokenize(query);

    if (tokens.length === 0) {
      return [];
    }

    const results = inferenceRepository
      .getAll()
      .map((item) => {
        const subject = String(item.subjectLabel ?? item.subject ?? "");
        const relation = String(item.relation ?? "");
        const object = String(item.objectLabel ?? item.object ?? "");

        const text = `${subject} ${relation} ${object}`.toLowerCase();

        const matchedTokens = tokens.filter((token) => text.includes(token));

        const coverage = matchedTokens.length / Math.max(tokens.length, 1);

        const confidence = Number(item.confidence ?? 0);

        return {
          item,
          subject,
          relation,
          object,
          matchedTokens,
          coverage,
          confidence,
          score: coverage * 0.7 + confidence * 0.3,
        };
      })
      .filter((item) => item.matchedTokens.length > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => ({
        memory: {
          id: `graph-evidence-${this.buildStableId(
            item.subject,
            item.relation,
            item.object,
          )}`,
          text: `${item.subject} ${item.relation} ${item.object}`,
          confidence: item.confidence,
          createdAt: new Date().toISOString(),
          metadata: {
            type: "graph-evidence",
            relation: item.relation,
            subject: item.subject,
            object: item.object,
            matchedTokens: item.matchedTokens,
            coverage: item.coverage,
          },
        },
        score: item.score,
        source: "graph-evidence" as const,
      }));

    return options?.limit !== undefined
      ? results.slice(0, options.limit)
      : results;
  }

  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  private buildStableId(
    subject: string,
    relation: string,
    object: string,
  ): string {
    return `${subject}-${relation}-${object}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "");
  }
}
