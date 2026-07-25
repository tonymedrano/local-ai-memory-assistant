import { v4 as uuid } from "uuid";

import { createEmbedding } from "../ai/ollama.service.js";

import { saveMemory, searchSimilarMemories } from "../qdrant/qdrant.service.js";

import { MemoryType, type Memory } from "./memory.types.js";

const SIMILARITY_THRESHOLD = 0.9;

export async function consolidateMemory(memory: Memory) {
  const vector = await createEmbedding(memory.text);

  const similar = await searchSimilarMemories(vector, {
    project: memory.project,
    type: memory.type,
  });

  const candidate = similar.find(
    (item: any) => item.score >= SIMILARITY_THRESHOLD,
  );

  if (candidate) {
    const existing = candidate;

    const updated: Memory = {
      ...existing,

      importance: Math.max(existing.importance ?? 0, memory.importance ?? 0.5),

      confidence: Math.min(1, (existing.confidence ?? 0.8) + 0.05),

      accessCount: (existing.accessCount ?? 0) + 1,

      updatedAt: new Date().toISOString(),
    };

    await saveMemory(existing.id, vector, updated);

    return {
      action: "merged",
      memory: updated,
    };
  }

  const created: Memory = {
    ...memory,

    id: uuid(),

    importance: memory.importance ?? 0.5,

    confidence: memory.confidence ?? 0.8,

    accessCount: 0,

    origin: memory.origin ?? "user",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  await saveMemory(created.id!, vector, created);

  return {
    action: "created",
    memory: created,
  };
}
