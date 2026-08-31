import { qdrant } from "../qdrant/qdrant.client.js";
import { config } from "../config.js";
import type { Memory, MemoryItem } from "./memory.types.js";

export type MemoryQdrantClient = Pick<
  typeof qdrant,
  "upsert" | "search" | "setPayload" | "scroll" | "delete"
>;

export interface SearchOptions {
  limit?: number;
  project?: string;
  type?: string;
  scoreThreshold?: number;
}

export interface MemorySearchResult {
  id: string | number;
  score: number;
  payload: Memory;
}

export class MemoryRepository {
  constructor(
    private readonly client: MemoryQdrantClient = qdrant,
    private readonly collection: string = config.memoryCollection,
  ) {}

  async save(id: string, vector: number[], memory: Memory) {
    await this.client.upsert(this.collection, {
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

  async search(
    vector: number[],
    options?: SearchOptions,
  ): Promise<MemorySearchResult[]> {
    const filterConditions = [];

    if (options?.project) {
      filterConditions.push({
        key: "project",
        match: {
          value: options.project,
        },
      });
    }

    if (options?.type) {
      filterConditions.push({
        key: "type",
        match: {
          value: options.type,
        },
      });
    }

    const results = await this.client.search(this.collection, {
      vector,
      limit: options?.limit ?? 5,
      with_payload: true,
      ...(filterConditions.length > 0
        ? {
            filter: {
              must: filterConditions,
            },
          }
        : {}),
      ...(options?.scoreThreshold !== undefined
        ? {
            score_threshold: options.scoreThreshold,
          }
        : {}),
    });

    return results.map((result) => ({
      ...result,
      payload: {
        ...(result.payload as unknown as Memory),
        id: String(result.id),
      },
    }));
  }

  async findSimilar(
    vector: number[],
    project?: string,
    excludeId?: string,
    scoreThreshold = 0.9,
  ) {
    const results = await this.client.search(this.collection, {
      vector,
      limit: 10,
      with_payload: true,
      score_threshold: scoreThreshold,
    });

    const candidates = results.filter(
      (result) => String(result.id) !== excludeId,
    );

    const result = candidates.find((candidate) => {
      if (!candidate.payload) {
        return false;
      }

      const payload = candidate.payload as unknown as Memory;

      if (project && payload.project !== project) {
        return false;
      }

      return true;
    });

    if (!result || !result.payload) {
      return null;
    }

    const payload = result.payload as unknown as Memory;

    return {
      id: String(result.id),
      score: result.score,
      payload,
    };
  }

  async update(id: string | number, payload: Record<string, unknown>) {
    await this.client.setPayload(this.collection, {
      points: [id],

      payload: {
        ...payload,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async findPendingKnowledgeExtraction(): Promise<MemoryItem[]> {
    const result = await this.client.scroll(this.collection, {
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
    await this.client.setPayload(this.collection, {
      points: [id],

      payload: {
        knowledgeExtracted: true,

        updatedAt: new Date().toISOString(),
      },
    });
  }

  async getAll(): Promise<Memory[]> {
    const result = await this.client.scroll(this.collection, {
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
    await this.client.delete(this.collection, {
      points: [id],
    });
  }

  async findById(id: string) {
    const memories = await this.getAll();

    return memories.find((memory) => memory.id === id);
  }
}
