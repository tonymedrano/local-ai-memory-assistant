// src/qdrant/qdrant.service.ts

import { config } from "../config.js";

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
