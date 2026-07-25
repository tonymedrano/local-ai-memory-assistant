import { createEmbedding } from "../ai/ollama.service.js";
import { saveMemory, searchMemory, findSimilarMemory, updateMemory } from "../qdrant/qdrant.service.js";
import type { Memory, MemoryType } from "./memory.types.js";
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

    createdAt: now,

    updatedAt: now,

    origin: memory.origin ?? "user",
  };

  const vector = await createEmbedding(enrichedMemory.text);

  const similar =
  await findSimilarMemory(
    vector,
    enrichedMemory.project,
  );

  if (similar) {
    const current = similar.payload;

    await updateMemory(
      similar.id,

      {
        accessCount: Number(current.accessCount ?? 0) + 1,

        updatedAt: now,
      },
    );

    return {
      ...current,

      id: similar.id,

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
export async function recall(
  query: string,

  options?: RecallOptions,
) {
  const vector = await createEmbedding(query);

  return await searchMemory(
    vector,

    options,
  );
}
