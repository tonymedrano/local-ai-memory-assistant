import type { Memory } from "../memory/memory.types.js";

export function increaseImportance(memory: Memory) {
  memory.accessCount = (memory.accessCount ?? 0) + 1;
  memory.importance = Math.min((memory.importance ?? 0.5) + 0.1, 10);
  memory.lastAccess = new Date().toISOString();
}

export function decreaseImportance(memory: Memory) {
  memory.importance = Math.max((memory.importance ?? 0.5) - 0.02, 0);
}
