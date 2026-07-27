import { createEmbedding } from "../ai/ollama.service.js";
import {
  saveMemory,
  searchMemory,
  findSimilarMemory,
  updateMemory,
} from "../qdrant/qdrant.service.js";
import type { Memory, MemoryType, RecallResult } from "./memory.types.js";
import { randomUUID } from "node:crypto";

/**
 * Opciones de búsqueda de memoria contextual.
 *
 * Permite limitar resultados por proyecto
 * o tipo de memoria.
 */
export interface RecallOptions {
  project?: string;

  type?: MemoryType;
}

/**
 * Guarda una memoria en la base vectorial.
 *
 * Flujo:
 *
 * Memory
 *   |
 *   v
 * Embedding Ollama
 *   |
 *   v
 * Qdrant
 *
 */
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

  const similar = await findSimilarMemory(vector, enrichedMemory.project);

  if (similar) {
    const current = similar.payload;

    await updateMemory(
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

      accessCount: Number(current.accessCount ?? 0) + 1,

      updatedAt: now,
    };
  }

  await saveMemory(
    enrichedMemory.id!,

    vector,

    enrichedMemory,
  );

  return enrichedMemory;
}

/**
 * Recupera memorias relacionadas
 * con una consulta.
 *
 * Ejemplo:
 *
 * "¿Qué arquitectura usamos?"
 *
 * devuelve:
 *
 * - decisiones
 * - documentación
 * - facts
 * relacionados
 *
 */
export async function recall(query: string, options?: RecallOptions) {
  const vector = await createEmbedding(query);

  const results = await searchMemory(vector, options);

  for (const memory of results) {
    await updateMemory(
      memory.id,

      {
        accessCount: Number(memory.payload.accessCount ?? 0) + 1,

        importance: Math.min(
          Number(memory.payload.importance ?? 0.5) + 0.05,
          10,
        ),

        lastAccess: new Date().toISOString(),

        updatedAt: new Date().toISOString(),
      },
    );
  }

  return results.filter((memory: RecallResult) => memory.payload.archived !== true);
}
