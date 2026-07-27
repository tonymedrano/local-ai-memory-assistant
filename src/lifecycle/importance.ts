import type { Memory } from "../memory/memory.types.js";

export function increaseImportance(memory: Memory) {
  memory.accesses++;

  memory.lastAccess = new Date().toISOString();

  memory.importance = Math.min(memory.importance + 0.1, 10);
}

export function decreaseImportance(memory: Memory) {
  memory.importance = Math.max(memory.importance - 0.02, 0);
}
