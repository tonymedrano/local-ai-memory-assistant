import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import { WeightedReciprocalRankFusion } from "./weighted.rrf.js";
import type { SemanticQuery } from "../expansion/semantic.types.js";
import type { GraphEvidenceRetriever } from "../graph/graph.evidence.retriever.js";
import { SemanticReranker } from "../reranking/semantic.reranker.js";
import type { RetrievalOptions } from "../retrieval.types.js";

export class HybridRetriever {
  constructor(
    private readonly vector: VectorRetriever,
    private readonly keyword: KeywordRetriever,
    private readonly graph: GraphRetriever,
    private readonly graphEvidence: GraphEvidenceRetriever,
    private readonly fusion: WeightedReciprocalRankFusion,
    private readonly reranker: SemanticReranker,
  ) {}

  async search(
    query: string,
    semantic?: SemanticQuery,
    options?: RetrievalOptions,
  ): Promise<RetrievalResult[]> {
    const expandedQuery =
      semantic?.expandedTerms.map((term) => term.term).join(" ") ?? query;

    const [vectorResults, keywordResults, graphResults, evidenceResults] =
      await Promise.all([
        this.vector.search(expandedQuery, {
          project: options?.project,
          type: options?.type,
        }),

        this.keyword.search(expandedQuery, {
          project: options?.project,
          type: options?.type,
        }),

        this.graph.search(expandedQuery),
        this.graphEvidence.search(expandedQuery),
      ]);

    const fused = this.fusion.fuse(
      vectorResults,
      keywordResults,
      graphResults,
      evidenceResults,
    );

    return this.reranker.rerank(
      fused,
      semantic?.expandedTerms.map((item) =>
        typeof item === "string" ? item : item.term,
      ),
    );
  }
}
