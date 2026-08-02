import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
import type { RetrievalResult } from "../types.js";
import { WeightedReciprocalRankFusion } from "./weighted.rrf.js";
import type { SemanticQuery } from "../expansion/semantic.types.js";
import type { GraphEvidenceRetriever } from "../graph/graph.evidence.retriever.js";

export class HybridRetriever {
  private readonly fusion = new WeightedReciprocalRankFusion();

  constructor(
    private readonly vector: VectorRetriever,
    private readonly keyword: KeywordRetriever,
    private readonly graph: GraphRetriever,
    private readonly graphEvidence: GraphEvidenceRetriever,
  ) {}

  async search(
    query: string,
    semantic?: SemanticQuery,
  ): Promise<RetrievalResult[]> {
    const expandedQuery =
      semantic?.expandedTerms.map((term) => term.term).join(" ") ?? query;

    const [vectorResults, keywordResults, graphResults, evidenceResults] =
      await Promise.all([
        this.vector.search(expandedQuery),
        this.keyword.search(expandedQuery),
        this.graph.search(expandedQuery),
        this.graphEvidence.search(expandedQuery),
      ]);

    return this.fusion.fuse(
      vectorResults,
      keywordResults,
      graphResults,
      evidenceResults,
    );
  }
}
