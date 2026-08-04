import { config } from "../../config.js";

import type { Reranker, RankedResult } from "../reranker.types.js";

import type { RetrievalResult } from "../types.js";

export class OllamaReranker implements Reranker {
  async rerank(
    query: string,
    candidates: RetrievalResult[],
  ): Promise<RankedResult[]> {
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const score = await this.score(query, candidate.memory.text);

        return {
          ...candidate,
          rerankScore: score,
        };
      }),
    );

    return results.sort((a, b) => b.rerankScore - a.rerankScore);
  }

  private async score(query: string, document: string): Promise<number> {
    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: config.chatModel,
        stream: false,
        prompt: `
            You are a search relevance model.

            Your task is to score how useful a document is for answering the query.

            Scoring rules:

            1.0 - The document directly answers the query or contains the exact concept.
            0.7 - The document is strongly related.
            0.4 - The document is somewhat related.
            0.1 - The document is barely related.
            0.0 - The document is irrelevant.

            Query:
            ${query}

            Document:
            ${document}

            Return ONLY the score as a decimal number.
            `,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    console.log("RERANK RAW:", data.response);

    const score = Number(data.response.trim());

    if (Number.isNaN(score)) {
      return 0;
    }

    return Math.min(Math.max(score, 0), 1);
  }
}
