export interface RetrievalStrategy {
  vectorWeight: number;
  keywordWeight: number;
  graphWeight: number;

  topK: number;

  enableReranking: boolean;
  enableGraphTraversal: boolean;
  enableQueryExpansion: boolean;
}
