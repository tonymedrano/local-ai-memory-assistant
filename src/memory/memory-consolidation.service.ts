import { searchSimilarMemories } from "../qdrant/qdrant.service.js";
import { createEmbedding } from "../ai/ollama.service.js";
import type { Memory } from "./memory.types.js";

export interface ConsolidationResult {
  merged: boolean;

  memory?: Memory;

  removedIds?: string[];
}

/**
 * Consolida memorias similares.
 *
 * Responsabilidades:
 *
 * - Detectar duplicados semánticos
 * - Fusionar metadatos
 * - Incrementar relevancia
 *
 */
export async function consolidateMemory(
  memory: Memory,
): Promise<ConsolidationResult> {
  const vector = await createEmbedding(memory.text);

  const similar = await searchSimilarMemories(vector, {
    project: memory.project,
    type: memory.type,
  });

  if (!similar.length) {
    return {
      merged: false,
    };
  }

  const existing = similar[0];

  const consolidated: Memory = {
    ...existing,

    importance:
      Math.max(existing.importance ?? 0, memory.importance ?? 0) + 0.1,

    confidence: Math.min(1, (existing.confidence ?? 0.5) + 0.1),

    accessCount: (existing.accessCount ?? 0) + 1,

    updatedAt: new Date().toISOString(),
  };

  return {
    merged: true,

    memory: consolidated,

    removedIds: [memory.id!],
  };
}
