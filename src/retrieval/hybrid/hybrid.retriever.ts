import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import { ReciprocalRankFusion } from "./rrf.js";
import type { RetrievalResult } from "../types.js";
export class HybridRetriever {
  private readonly fusion = new ReciprocalRankFusion();

  constructor(
    private readonly vectorRetriever: VectorRetriever,
    private readonly keywordRetriever: KeywordRetriever,
  ) {}

  async search(query: string): Promise<RetrievalResult[]> {
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorRetriever.search(query),
      this.keywordRetriever.search(query),
    ]);

    return this.fusion.fuse(vectorResults, keywordResults);
  }
}
