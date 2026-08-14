import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import { WeightedReciprocalRankFusion } from "./weighted.rrf.js";
import type { SemanticQuery } from "../expansion/semantic.types.js";
import type { GraphEvidenceRetriever } from "../graph/graph.evidence.retriever.js";
import { SemanticReranker } from "../reranking/semantic.reranker.js";
import type { RetrievalOptions } from "../retrieval.types.js";

import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";

export interface FusionStrategyWeights {
  vector: number;
  keyword: number;
  graph: number;
}

interface HybridSearchRequest {
  query: string;
  semantic?: SemanticQuery;
  options?: RetrievalOptions;
  strategy: RetrievalStrategy;
}

export class HybridRetriever {
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
      semantic?.expandedTerms.map((term) => term.term).join(" ") ?? query;

    const mode = strategy?.mode ?? "hybrid";

    const useVector =
      mode === "vector" ||
      mode === "hybrid" ||
      mode === "graph" ||
      mode === "hybrid_graph";

    const useKeyword =
      mode === "keyword" ||
      mode === "hybrid" ||
      mode === "graph" ||
      mode === "hybrid_graph";

    const useGraph = mode === "graph" || mode === "hybrid_graph";

    const useGraphEvidence = mode === "graph" || mode === "hybrid_graph";

    const [vectorResults, keywordResults, graphResults, evidenceResults] =
      await Promise.all([
        useVector
          ? this.vector.search(expandedQuery, {
              project: options?.project,
              type: options?.type,
            })
          : Promise.resolve([]),

        useKeyword
          ? this.keyword.search(expandedQuery, {
              project: options?.project,
              type: options?.type,
            })
          : Promise.resolve([]),

        useGraph ? this.graph.search(expandedQuery) : Promise.resolve([]),

        useGraphEvidence
          ? this.graphEvidence.search(expandedQuery)
          : Promise.resolve([]),
      ]);

    const fused = this.fusion.fuse(
      vectorResults,
      keywordResults,
      graphResults,
      evidenceResults,
      {
        vector: strategy.vectorWeight,
        keyword: strategy.keywordWeight,
        graph: strategy.graphWeight,
        graphEvidence: strategy.graphEvidenceWeight,
      },
    );

    return this.reranker.rerank(
      fused,
      semantic?.expandedTerms.map((item) =>
        typeof item === "string" ? item : item.term,
      ),
    );
  }
}
