import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import { ReciprocalRankFusion } from "./rrf.js";
import type { RetrievalResult } from "../types.js";
import type { GraphRetriever } from "../graph/graph.retriever.js";
export class HybridRetriever {
  private readonly fusion = new ReciprocalRankFusion();

  constructor(
    private vector: VectorRetriever,
    private keyword: KeywordRetriever,
    private graph: GraphRetriever,
  ) {}

  async search(query: string) {
    const [vector, keyword, graph] = await Promise.all([
      this.vector.search(query),
      this.keyword.search(query),
      this.graph.search(query),
    ]);

    return [...vector, ...keyword, ...graph];
  }
}
