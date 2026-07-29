import type { Memory } from "../memory/memory.types.js";

const DAYS = 180;

export function shouldArchive(
  memory: Memory,
  daysWithoutAccess: number,
): boolean {
  return (memory.importance ?? 0) < 0.5 && daysWithoutAccess > DAYS;
}
