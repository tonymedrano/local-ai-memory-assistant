import { randomUUID } from "node:crypto";

import { createEmbedding } from "../ai/ollama.service.js";

import type { Memory, MemoryType } from "./memory.types.js";
import type {
  MemoryRepository,
  MemorySearchResult,
} from "./memory.repository.js";

import type { KeywordIndex } from "../retrieval/index/keyword.index.js";

export interface RecallOptions {
  project?: string;
  type?: MemoryType;
}

export function createMemoryService(
  repository: MemoryRepository,
  keywordIndex: KeywordIndex,
) {
  const store = async (memory: Memory, tenantId?: string) => {
    const now = new Date().toISOString();

    const enrichedMemory: Memory = {
      ...memory,
      id: randomUUID(),
      importance: memory.importance ?? 0.5,
      confidence: memory.confidence ?? 0.8,
      accessCount: 0,
      lastAccess: now,
      archived: false,
      createdAt: now,
      updatedAt: now,
      origin: memory.origin ?? "user",
      ...(tenantId ? { tenantId } : {}),
    };

    const vector = await createEmbedding(enrichedMemory.text);

    const similar = await repository.findSimilar(
      vector,
      enrichedMemory.project,
      undefined,
      0.9,
      tenantId,
    );

    /*
     * Existing memory
     *
     * Instead of creating a duplicate, update the existing memory
     * and refresh the keyword index with the resulting representation.
     */
    if (similar) {
      const current = similar.payload ?? {};

      await repository.update(similar.id, {
        accessCount: Number(current.accessCount ?? 0) + 1,
        importance: Math.min(
          Number(current.importance ?? 0.5) + 0.1,
          10,
        ),
        lastAccess: now,
        updatedAt: now,
      });

      const updatedMemory: Memory = {
        ...current,
        id: similar.id,
        updatedAt: now,
        accessCount: Number(current.accessCount ?? 0) + 1,
        importance: Math.min(
          Number(current.importance ?? 0.5) + 0.1,
          10,
        ),
        lastAccess: now,
      } as Memory;

      keywordIndex.add(updatedMemory);

      return updatedMemory;
    }

    /*
     * New memory
     */
    await repository.save(
      enrichedMemory.id!,
      vector,
      enrichedMemory,
    );

    keywordIndex.add(enrichedMemory);

    return enrichedMemory;
  };

  const recall = async (
    query: string,
    options?: RecallOptions,
    tenantId?: string,
  ): Promise<MemorySearchResult[]> => {
    const vector = await createEmbedding(query);

    const results = await repository.search(vector, {
      project: options?.project,
      type: options?.type,
      tenantId,
    });

    for (const memory of results) {
      const payload = memory.payload ?? {};

      await repository.update(memory.id, {
        accessCount: Number(payload.accessCount ?? 0) + 1,
        importance: Math.min(
          Number(payload.importance ?? 0.5) + 0.05,
          10,
        ),
        lastAccess: new Date().toISOString(),
      });
    }

    return results.filter(
      (memory) => memory.payload?.archived !== true,
    );
  };

  return {
    store,
    recall,
  };
}
