import { createEmbedding } from "../ai/ollama.service.js";
import { randomUUID } from "node:crypto";

import type { Memory, MemoryType } from "./memory.types.js";

import { MemoryRepository } from "./memory.repository.js";

const repository = new MemoryRepository();

export interface RecallOptions {
  project?: string;

  type?: MemoryType;
}

export async function store(memory: Memory) {
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
  };

  const vector = await createEmbedding(enrichedMemory.text);

  const similar = await repository.findSimilar(vector, enrichedMemory.project);

  if (similar) {
    const current = similar.payload ?? {};

    await repository.update(
      similar.id,

      {
        accessCount: Number(current.accessCount ?? 0) + 1,

        importance: Math.min(Number(current.importance ?? 0.5) + 0.1, 10),

        lastAccess: now,

        updatedAt: now,
      },
    );

    return {
      ...current,

      id: similar.id,

      updatedAt: now,
    };
  }

  await repository.save(enrichedMemory.id!, vector, enrichedMemory);

  return enrichedMemory;
}

export async function recall(
  query: string,

  options?: RecallOptions,
) {
  const vector = await createEmbedding(query);

  const results = await repository.search(
    vector,

    {
      project: options?.project,

      type: options?.type,
    },
  );

  for (const memory of results) {
    const payload = memory.payload ?? {};

    await repository.update(
      memory.id,

      {
        accessCount: Number(payload.accessCount ?? 0) + 1,

        importance: Math.min(Number(payload.importance ?? 0.5) + 0.05, 10),

        lastAccess: new Date().toISOString(),
      },
    );
  }

  return results.filter((memory) => memory.payload?.archived !== true);
}
