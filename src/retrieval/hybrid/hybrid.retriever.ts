import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import { ReciprocalRankFusion } from "./rrf.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
import type { RetrievalResult } from "../types.js";

export class HybridRetriever {
  private readonly fusion = new ReciprocalRankFusion();

  constructor(
    private readonly vector: VectorRetriever,
    private readonly keyword: KeywordRetriever,
    private readonly graph: GraphRetriever,
  ) {}

  async search(query: string): Promise<RetrievalResult[]> {
    const [vectorResults, keywordResults, graphResults] = await Promise.all([
      this.vector.search(query),
      this.keyword.search(query),
      this.graph.search(query),
    ]);

    return this.fusion.fuse(
      vectorResults,
      keywordResults,
      graphResults,
    );
  }
}