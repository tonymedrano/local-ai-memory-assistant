// src/qdrant/qdrant.service.ts

import { config } from "../config.js";

import type { MemoryType } from "../memory/memory.types.js";

const baseUrl = config.qdrantUrl;

/**
 * Inicializa la colección principal del sistema.
 *
 * Usada por el indexador:
 *
 * global_memory
 *      |
 *      +-- archivos
 *      +-- chunks
 *      +-- documentación
 */
export async function initCollection() {
  const response = await fetch(`${baseUrl}/collections`);

  if (!response.ok) {
    throw new Error(`Qdrant error ${response.status}`);
  }

  const data = await response.json();

  const exists = data.result.collections.some(
    (c: any) => c.name === config.collection,
  );

  if (!exists) {
    const create = await fetch(`${baseUrl}/collections/${config.collection}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        vectors: {
          size: 768,
          distance: "Cosine",
        },
      }),
    });

    if (!create.ok) {
      throw new Error(await create.text());
    }
  }
}

/**
 * Inicializa la colección de memoria contextual.
 *
 * contextual_memory
 *      |
 *      +-- decisiones
 *      +-- hechos
 *      +-- soluciones
 *      +-- conocimiento
 */
export async function initMemoryCollection() {
  const response = await fetch(`${baseUrl}/collections`);

  if (!response.ok) {
    throw new Error(`Qdrant error ${response.status}`);
  }

  const data = await response.json();

  const exists = data.result.collections.some(
    (c: any) => c.name === config.memoryCollection,
  );

  if (!exists) {
    const create = await fetch(
      `${baseUrl}/collections/${config.memoryCollection}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          vectors: {
            size: 768,
            distance: "Cosine",
          },
        }),
      },
    );

    if (!create.ok) {
      throw new Error(await create.text());
    }
  }
}

/**
 * Guarda una memoria contextual.
 *
 * Usa:
 *
 * contextual_memory
 *
 */
export async function saveMemory(
  id: string,

  vector: number[],

  payload: Record<string, unknown> | any,
) {
    console.log("QDRANT SAVE");
  console.log({
    collection: config.memoryCollection,
    id,
    vectorSize: vector.length,
    payload
  });
  const response = await fetch(
    `${baseUrl}/collections/${config.memoryCollection}/points`,

    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        points: [
          {
            id,

            vector,

            payload,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export interface SearchOptions {
  project?: string;

  type?: MemoryType;
}

/**
 * Busca memoria contextual.
 *
 * Permite filtrar por:
 *
 * - proyecto
 * - tipo de memoria
 *
 */
export async function searchMemory(
  vector: number[],

  options?: SearchOptions,
) {
  const filter: any = {};

  if (options?.project) {
    filter.must ??= [];

    filter.must.push({
      key: "project",

      match: {
        value: options.project,
      },
    });
  }

  if (options?.type) {
    filter.must ??= [];

    filter.must.push({
      key: "type",

      match: {
        value: options.type,
      },
    });
  }

  const response = await fetch(
    `${baseUrl}/collections/${config.memoryCollection}/points/search`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        vector,

        limit: 5,

        with_payload: true,

        score_threshold: 0.6,

        ...(Object.keys(filter).length
          ? {
              filter,
            }
          : {}),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}
