export interface StoredFeatureVector {
  id: string;

  query: string;

  memoryId: string;

  features: {
    semantic?: number;
    bm25?: number;
    importance?: number;
    confidence?: number;
    freshness?: number;
  };

  createdAt: Date;
}
