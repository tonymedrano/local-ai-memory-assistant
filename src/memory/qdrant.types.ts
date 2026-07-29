export interface QdrantScoredPoint {
  id: string | number;

  version?: number;

  score: number;

  payload?: Record<string, unknown> | null;

  vector?: unknown;
}