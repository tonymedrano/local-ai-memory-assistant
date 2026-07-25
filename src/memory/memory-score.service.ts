import type { Memory } from "./memory.types.js";

export function calculateMemoryScore(memory: Memory): number {
  const confidence = memory.confidence ?? 0.5;

  const importance = memory.importance ?? 0.5;

  const accessCount = memory.accessCount ?? 0;

  const usage = Math.min(accessCount / 10, 1);

  const freshness = calculateFreshness(memory.updatedAt ?? memory.createdAt);

  const score =
    confidence * 0.4 + importance * 0.3 + usage * 0.2 + freshness * 0.1;

  return Number(score.toFixed(3));
}

function calculateFreshness(date?: string): number {
  if (!date) {
    return 0.5;
  }

  const created = new Date(date).getTime();

  const now = Date.now();

  const days = (now - created) / (1000 * 60 * 60 * 24);

  /*
    0 días  -> 1
    30 días -> 0.5
    365 días -> casi 0
  */

  const freshness = Math.exp(-days / 30);

  return Number(freshness.toFixed(3));
}
