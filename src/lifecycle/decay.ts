import type { Memory } from "../memory/memory.types.js";

export function decreaseImportance(memory: Memory) {
  memory.importance = Math.max((memory.importance ?? 0.5) - 0.02, 0);
}
