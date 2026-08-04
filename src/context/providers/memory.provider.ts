import { retrievalPipeline } from "../../core/container.js";

import type { Memory } from "../../memory/memory.types.js";

export class MemoryProvider {
  async search(query: string): Promise<Memory[]> {
    const result = await retrievalPipeline.retrieve({
      query,
      limit: 5,
    });

    console.table(
      result.memories.map((m) => ({
        source: m.source,
        score: m.score,
        text: m.memory.text,
      })),
    );

    return result.memories.map((m) => m.memory);
  }
}
