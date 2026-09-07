export type RetrievalMode =
  | "vector"
  | "keyword"
  | "hybrid"
  | "graph"
  | "hybrid_graph"
  | "knowledge";

export interface RetrievalStrategy {
  mode: RetrievalMode;

  vectorWeight: number;
  keywordWeight: number;
  graphWeight: number;
  graphEvidenceWeight: number;

  topK: number;

  expandQuery: boolean;
  rerank: boolean;

  temporalBoost: number;
}