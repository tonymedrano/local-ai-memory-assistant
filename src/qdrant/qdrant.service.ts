// src/qdrant/qdrant.service.ts

import { config } from "../config.js";

import type { MemoryType } from "../memory/memory.types.js";

const baseUrl = config.qdrantUrl;

export interface QdrantBootstrapOptions {
  baseUrl?: string;
  collection?: string;
  fetch?: typeof globalThis.fetch;
}

async function requestQdrant(
  fetchImplementation: typeof globalThis.fetch,
  qdrantUrl: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetchImplementation(`${qdrantUrl}${path}`, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(`Unable to reach Qdrant at ${qdrantUrl}: ${reason}`);
  }
}

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
export async function initCollection(options: QdrantBootstrapOptions = {}) {
  const qdrantUrl = options.baseUrl ?? config.qdrantUrl;
  const collection = options.collection ?? config.collection;
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const response = await requestQdrant(
    fetchImplementation,
    qdrantUrl,
    "/collections",
  );

  if (!response.ok) {
    throw new Error(`Qdrant collection bootstrap failed with status ${response.status}`);
  }

  const data = await response.json();

  const exists = data.result.collections.some(
    (c: any) => c.name === collection,
  );

  if (!exists) {
    const create = await requestQdrant(
      fetchImplementation,
      qdrantUrl,
      `/collections/${collection}`,
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
 * Inicializa la colección de memoria contextual.
 *
 * config.memoryCollection
 *      |
 *      +-- decisiones
 *      +-- hechos
 *      +-- soluciones
 *      +-- conocimiento
 */
export async function initMemoryCollection(
  options: QdrantBootstrapOptions = {},
) {
  const qdrantUrl = options.baseUrl ?? config.qdrantUrl;
  const collection = options.collection ?? config.memoryCollection;
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const response = await requestQdrant(
    fetchImplementation,
    qdrantUrl,
    "/collections",
  );

  if (!response.ok) {
    throw new Error(
      `Qdrant memory collection bootstrap failed with status ${response.status}`,
    );
  }

  const data = await response.json();

  const exists = data.result.collections.some(
    (c: any) => c.name === collection,
  );

  if (!exists) {
    const create = await requestQdrant(
      fetchImplementation,
      qdrantUrl,
      `/collections/${collection}`,
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
 * config.memoryCollection
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
    payload,
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

  const data = await response.json();

  return data.result;
}

export async function findSimilarMemory(
  vector: number[],
  project?: string,
  threshold = 0.9,
) {
  const filter: any = {};

  if (project) {
    filter.must = [
      {
        key: "project",

        match: {
          value: project,
        },
      },
    ];
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

        limit: 1,

        with_payload: true,

        score_threshold: threshold,

        ...(Object.keys(filter).length ? { filter } : {}),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  if (!data.result || data.result.length === 0) {
    return null;
  }

  return data.result[0];
}

export async function updateMemory(
  id: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(
    `${baseUrl}/collections/${config.memoryCollection}/points/payload`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        points: [id],

        payload,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

/**
 * Busca memorias similares para procesos internos.
 *
 * Usado por:
 *
 * - deduplicación
 * - consolidación
 * - refuerzo de memoria
 *
 */
export async function searchSimilarMemories(
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

        limit: 3,

        with_payload: true,

        score_threshold: 0.8,

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

  const data = await response.json();

  return (data.result ?? []).map((item: any) => ({
    id: item.id,

    score: item.score,

    ...(item.payload ?? {}),
  }));
}
