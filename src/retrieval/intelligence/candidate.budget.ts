import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";

export interface CandidateBudget {
  vector: number;
  keyword: number;
  graph: number;
  graphEvidence: number;
  total: number;
}

export class CandidateBudgeting {
  calculate(strategy: RetrievalStrategy): CandidateBudget {
    const topK = Math.max(1, Math.floor(strategy.topK));

    const weights = {
      vector: Math.max(0, strategy.vectorWeight),
      keyword: Math.max(0, strategy.keywordWeight),
      graph: Math.max(0, strategy.graphWeight),
      graphEvidence: Math.max(0, strategy.graphEvidenceWeight),
    };

    const weightSum =
      weights.vector +
      weights.keyword +
      weights.graph +
      weights.graphEvidence;

    if (weightSum === 0) {
      return {
        vector: topK,
        keyword: 0,
        graph: 0,
        graphEvidence: 0,
        total: topK,
      };
    }

    const raw = {
      vector: (topK * weights.vector) / weightSum,
      keyword: (topK * weights.keyword) / weightSum,
      graph: (topK * weights.graph) / weightSum,
      graphEvidence: (topK * weights.graphEvidence) / weightSum,
    };

    const budget = {
      vector: Math.floor(raw.vector),
      keyword: Math.floor(raw.keyword),
      graph: Math.floor(raw.graph),
      graphEvidence: Math.floor(raw.graphEvidence),
    };

    let remaining =
      topK -
      budget.vector -
      budget.keyword -
      budget.graph -
      budget.graphEvidence;

    const remainders = [
      {
        key: "vector" as const,
        remainder: raw.vector - budget.vector,
      },
      {
        key: "keyword" as const,
        remainder: raw.keyword - budget.keyword,
      },
      {
        key: "graph" as const,
        remainder: raw.graph - budget.graph,
      },
      {
        key: "graphEvidence" as const,
        remainder: raw.graphEvidence - budget.graphEvidence,
      },
    ].sort((a, b) => b.remainder - a.remainder);

    for (const item of remainders) {
      if (remaining <= 0) {
        break;
      }

      if (weights[item.key] <= 0) {
        continue;
      }

      budget[item.key]++;
      remaining--;
    }

    return {
      ...budget,
      total:
        budget.vector +
        budget.keyword +
        budget.graph +
        budget.graphEvidence,
    };
  }
}