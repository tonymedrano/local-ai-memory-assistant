import type { Memory } from "../memory/memory.types.js";
import { decreaseImportance } from "./importance.js";

export async function decay(memories: Memory[]) {
  for (const memory of memories) {
    decreaseImportance(memory);
  }
}
