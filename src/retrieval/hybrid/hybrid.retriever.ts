import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import {
  WeightedReciprocalRankFusion,
  type FusionWeights,
} from "./weighted.rrf.js";
import type { SemanticQuery } from "../expansion/semantic.types.js";
import type { GraphEvidenceRetriever } from "../graph/graph.evidence.retriever.js";
import { SemanticReranker } from "../reranking/semantic.reranker.js";
import type { RetrievalOptions } from "../retrieval.types.js";
import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";
import { CandidateBudgeting } from "../intelligence/candidate.budget.js";
import type { ContextModel } from "../../context/model/context.model.js";
import type { GraphScope } from "../../knowledge/graph/graph.types.js";
import { applyContextToCandidateBudget } from "../../context/retrieval/context.candidate.budget.js";

export interface HybridSearchRequest {
  scope: GraphScope;
  query: string;
  semantic?: SemanticQuery;
  options?: RetrievalOptions;
  strategy?: RetrievalStrategy;
  context?: ContextModel;
}

export class HybridRetriever {
  private readonly candidateBudgeting = new CandidateBudgeting();

  constructor(
    private readonly vector: VectorRetriever,
    private readonly keyword: KeywordRetriever,
    private readonly graph: GraphRetriever,
    private readonly graphEvidence: GraphEvidenceRetriever,
    private readonly fusion: WeightedReciprocalRankFusion,
    private readonly reranker: SemanticReranker,
  ) {}

  async search(request: HybridSearchRequest): Promise<RetrievalResult[]> {
    const { scope, query, semantic, options, strategy, context } = request;
    if (scope.kind !== "tenant" || options?.tenantId !== scope.tenantId) {
      throw new Error("Hybrid retrieval scope and tenantId must match");
    }

    const expandedQuery =
      semantic?.expandedTerms
        .map((term) => (typeof term === "string" ? term : term.term))
        .join(" ") ?? query;

    const baseBudget = strategy
      ? this.candidateBudgeting.calculate(strategy)
      : {
          vector: 5,
          keyword: 5,
          graph: 5,
          graphEvidence: 5,
          total: 5,
        };

    const budget = applyContextToCandidateBudget(baseBudget, context);

    const [vectorResults, keywordResults, graphResults, evidenceResults] =
      await Promise.all([
        this.vector.search(expandedQuery, {
          tenantId: options?.tenantId,
          project: options?.project,
          type: options?.type,
          limit: budget.vector,
        }),

        this.keyword.search(expandedQuery, {
          tenantId: options?.tenantId,
          project: options?.project,
          type: options?.type,
          limit: budget.keyword,
        }),

        this.graph.search(scope, expandedQuery, {
          limit: budget.graph,
        }),

        Promise.resolve([]),
      ]);

    const weights: FusionWeights = {
      vector: strategy?.vectorWeight ?? 1,
      keyword: strategy?.keywordWeight ?? 1,
      graph: strategy?.graphWeight ?? 1,
      graphEvidence: strategy?.graphEvidenceWeight ?? 1,
    };

    const fused = this.fusion.fuse(
      vectorResults,
      keywordResults,
      graphResults,
      evidenceResults,
      weights,
    );

    const reranked = this.reranker.rerank(
      fused,
      semantic?.expandedTerms.map((item) =>
        typeof item === "string" ? item : item.term,
      ),
    );

    return scope.kind === "tenant"
      ? reranked.filter((result) => result.memory.tenantId === scope.tenantId)
      : reranked;
  }
}
