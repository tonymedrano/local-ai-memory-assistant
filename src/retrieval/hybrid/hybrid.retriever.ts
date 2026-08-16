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

export interface HybridSearchRequest {
  query: string;
  semantic?: SemanticQuery;
  options?: RetrievalOptions;
  strategy?: RetrievalStrategy;
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
    const { query, semantic, options, strategy } = request;

    const expandedQuery =
      semantic?.expandedTerms
        .map((term) => (typeof term === "string" ? term : term.term))
        .join(" ") ?? query;

    const budget = strategy
      ? this.candidateBudgeting.calculate(strategy)
      : {
          vector: 5,
          keyword: 5,
          graph: 5,
          graphEvidence: 5,
          total: 5,
        };

    const [vectorResults, keywordResults, graphResults, evidenceResults] =
      await Promise.all([
        this.vector.search(expandedQuery, {
          project: options?.project,
          type: options?.type,
          limit: budget.vector,
        }),

        this.keyword.search(expandedQuery, {
          project: options?.project,
          type: options?.type,
          limit: budget.keyword,
        }),

        this.graph.search(expandedQuery, {
          limit: budget.graph,
        }),

        this.graphEvidence.search(expandedQuery, {
          limit: budget.graphEvidence,
        }),
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

    return this.reranker.rerank(
      fused,
      semantic?.expandedTerms.map((item) =>
        typeof item === "string" ? item : item.term,
      ),
    );
  }
}
