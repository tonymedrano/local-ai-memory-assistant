import type { ExpandedTerm } from "../expansion/semantic.types.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { FusionResult, FusionSignals } from "./fusion.types.js";

const SOURCE_BONUS: Record<string, number> = {
  vector: 0.0,
  keyword: 0.05,
  graph: 0.10,
  "graph-evidence": 0.20,
  hybrid: 0.0,
};

export class EvidenceFusion {
  fuse(
    results: RetrievalResult[],
    expandedTerms: ExpandedTerm[] = [],
  ): FusionResult[] {
    return results
      .map((result) => {
        const confidence =
          (result.memory.confidence ?? 1) * 0.15;

        const source =
          SOURCE_BONUS[result.source] ?? 0;

        const evidence =
          this.computeEvidenceBonus(result);

        const semantic =
          this.computeSemanticBonus(
            result.memory.text,
            expandedTerms,
          );

        const signals: FusionSignals = {
          rrf: result.score,
          source,
          confidence,
          evidence,
          semantic,
        };

        return {
          ...result,
          score:
            signals.rrf +
            signals.source +
            signals.confidence +
            signals.evidence +
            signals.semantic,
          signals,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private computeEvidenceBonus(
    result: RetrievalResult,
  ): number {
    const metadata =
      (result.memory as any).metadata;

    if (metadata?.type === "inference") {
      return 0.20;
    }

    if (
      result.originalSources?.includes(
        "graph-evidence",
      )
    ) {
      return 0.20;
    }

    return 0;
  }

  private computeSemanticBonus(
    text: string,
    expandedTerms: ExpandedTerm[],
  ): number {
    const lower = text.toLowerCase();

    let score = 0;

    for (const term of expandedTerms) {
      if (lower.includes(term.term.toLowerCase())) {
        score += 0.03 * term.weight;
      }
    }

    return Number(score.toFixed(3));
  }
}