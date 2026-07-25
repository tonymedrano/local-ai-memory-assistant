import { createEmbedding } from "../ai/ollama.service.js";
import { saveMemory, searchMemory } from "../qdrant/qdrant.service.js";
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

  const id =
    memory.id ??
    randomUUID();


  console.log("STORE MEMORY:", memory);


  const vector =
    await createEmbedding(
      memory.text,
    );


  console.log(
    "VECTOR SIZE:",
    vector.length,
  );


  const storedMemory: Memory = {

    ...memory,

    id,

    createdAt:
      memory.createdAt ??
      new Date().toISOString(),

  };


  await saveMemory(

    id,

    vector,

    storedMemory,

  );


  console.log(
    "MEMORY SAVED:",
    id,
  );


  return storedMemory;

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
