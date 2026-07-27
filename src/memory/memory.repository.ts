import { qdrant } from "../qdrant/qdrant.client.js";
import type { Memory } from "./memory.types.js";

const COLLECTION = "contextual_memory";

export interface SearchOptions {
  limit?: number;

  project?: string;

  type?: string;
}

export class MemoryRepository {
  async save(id: string, vector: number[], memory: Memory) {
    await qdrant.upsert(COLLECTION, {
      wait: true,

      points: [
        {
          id,

          vector,

          payload: {
            ...memory
          },
        },
      ],
    });
  }

  async search(vector: number[], options?: SearchOptions) {
    return qdrant.search(COLLECTION, {
      vector,

      limit: options?.limit ?? 5,

      with_payload: true,
    });
  }

  async findSimilar(vector: number[], project?: string) {
    const results = await qdrant.search(COLLECTION, {
      vector,

      limit: 1,

      with_payload: true,

      score_threshold: 0.9,
    });

    const memory = results[0];

    if (!memory) {
      return null;
    }

    if (project && memory.payload?.project !== project) {
      return null;
    }

    return memory;
  }

  async update(id: string | number, payload: Partial<Memory>) {
    await qdrant.setPayload(COLLECTION, {
      points: [id],

      payload: {
        ...payload,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async delete(id: string | number) {
    await qdrant.delete(COLLECTION, {
      points: [id],
    });
  }
}
