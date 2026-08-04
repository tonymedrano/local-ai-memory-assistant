import type { RetrievalResult } from "../types.js";

export class SemanticReranker {
  rerank(
    results: RetrievalResult[],
    semanticTerms: string[] = [],
  ): RetrievalResult[] {
    return results
      .map((result) => {
        let score = result.score;

        const text = result.memory.text.toLowerCase();

        //
        // Graph evidence boost
        //
        if (result.originalSources?.includes("graph-evidence")) {
          score *= 1.4;
        }

        //
        // Semantic expansion match
        //
        const matches = semanticTerms.filter((term) =>
          text.includes(term.toLowerCase()),
        );

        if (matches.length > 0) {
          score *= 1 + Math.min(matches.length * 0.05, 0.25);
        }

        //
        // Confidence boost
        //
        if (result.memory.confidence) {
          score *= 0.8 + result.memory.confidence * 0.2;
        }

        return {
          ...result,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
