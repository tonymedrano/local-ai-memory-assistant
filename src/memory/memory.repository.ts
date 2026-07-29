import { qdrant } from "../qdrant/qdrant.client.js";
import type { Memory, MemoryItem } from "./memory.types.js";

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
            ...memory,
            knowledgeExtracted: memory.knowledgeExtracted ?? false,
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

  async update(id: string | number, payload: Record<string, unknown>) {
    await qdrant.setPayload(COLLECTION, {
      points: [id],

      payload: {
        ...payload,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async findPendingKnowledgeExtraction(): Promise<MemoryItem[]> {
    const result = await qdrant.scroll(COLLECTION, {
      limit: 1000,

      with_payload: true,
    });

    return result.points
      .filter((point) => point.payload && !point.payload.knowledgeExtracted)
      .map((point) => {
        const payload = point.payload as unknown as Memory;

        return {
          id: String(point.id),

          text: payload.text,

          importance: payload.importance ?? 0,

          createdAt: payload.createdAt ?? new Date().toISOString(),

          knowledgeExtracted: payload.knowledgeExtracted,
        };
      });
  }

  async markKnowledgeExtracted(id: string) {
    await qdrant.setPayload(COLLECTION, {
      points: [id],

      payload: {
        knowledgeExtracted: true,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async getAll(): Promise<Memory[]> {
    const result = await qdrant.scroll(COLLECTION, {
      limit: 1000,

      with_payload: true,
    });

    return result.points.map((point) => {
      const payload = point.payload as unknown as Memory;

      return {
        ...payload,

        id: String(point.id),
      };
    });
  }

  async delete(id: string | number) {
    await qdrant.delete(COLLECTION, {
      points: [id],
    });
  }

  async findById(id: string) {
    const memories = await this.getAll();

    return memories.find((memory) => memory.id === id);
  }
}
