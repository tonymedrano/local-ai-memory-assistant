export interface ScoreInput {
  confidence?: number;

  importance?: number;

  accessCount?: number;

  updatedAt?: string;
}

export function calculateRelevanceScore(item: ScoreInput): number {
  const confidence = item.confidence ?? 0.5;

  const importance = item.importance ?? 0.5;

  const access = Math.min((item.accessCount ?? 0) / 10, 1);

  let freshness = 0.5;

  if (item.updatedAt) {
    const updated = new Date(item.updatedAt).getTime();

    const now = Date.now();

    const days = (now - updated) / (1000 * 60 * 60 * 24);

    freshness = Math.max(0, 1 - days / 30);
  }

  const score =
    confidence * 0.35 + importance * 0.35 + access * 0.15 + freshness * 0.15;

  return Number(score.toFixed(3));
}
