import { qdrant } from "../qdrant/qdrant.client.js";
import type { Memory } from "./memory.content.types.js";

const COLLECTION = "contextual_memory";

export class MemoryRepository {
  async save(memory: Memory, vector: number[]) {
    await qdrant.upsert(COLLECTION, {
      wait: true,

      points: [
        {
          id: memory.id,

          vector,

          payload: {
            content: memory.content,

            ...memory.metadata,
          },
        },
      ],
    });
  }

  async search(vector: number[], limit = 5) {
    return qdrant.search(COLLECTION, {
      vector,

      limit,
    });
  }

  async delete(id: string) {
    await qdrant.delete(COLLECTION, {
      points: [id],
    });
  }
}
