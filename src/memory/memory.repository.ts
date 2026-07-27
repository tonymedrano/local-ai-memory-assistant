import { qdrant } from "../qdrant/qdrant.client.js";
import type { Memory, MemoryMetadata } from "./memory.content.types.js";

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

      with_payload: true,
    });
  }

  async updateMetadata(id: string, metadata: Partial<MemoryMetadata>) {
    await qdrant.setPayload(COLLECTION, {
      points: [id],

      payload: {
        ...metadata,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async getAll() {
    const result = await qdrant.scroll(COLLECTION, {
      limit: 1000,

      with_payload: true,
    });

    return result.points;
  }

  async delete(id: string) {
    await qdrant.delete(COLLECTION, {
      points: [id],
    });
  }
}
