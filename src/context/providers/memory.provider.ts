import { recall } from "../../memory/memory.service.js";
import type { Memory } from "../../memory/memory.types.js";

export class MemoryProvider {
  async search(query: string): Promise<Memory[]> {
    const results = await recall(query);

    return results.map((result) => result.payload);
  }
}
