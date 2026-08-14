import { createEmbedding } from "../../ai/ollama.service.js";

import type { Reranker, RankedResult } from "../reranker.types.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class EmbeddingReranker implements Reranker {
  async rerank(
    query: string,
    candidates: RetrievalResult[],
  ): Promise<RankedResult[]> {
    const queryVector = await createEmbedding(query);

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const documentVector = await createEmbedding(candidate.memory.text);

        const score = cosineSimilarity(queryVector, documentVector);

        return {
          ...candidate,
          rerankScore: score,
        };
      }),
    );

    return results.sort((a, b) => b.rerankScore - a.rerankScore);
  }
}
