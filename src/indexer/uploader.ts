/**
 * Comunicación con Qdrant.
 *
 * Aquí:
 *
 * - Insertamos vectores
 * - Eliminamos vectores antiguos
 *
 */

import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: "http://localhost:6333",

  checkCompatibility: false,
});

const COLLECTION = "global_memory";

/**
 * Guarda un vector en Qdrant.
 */
export async function uploadVector(
  id: string,

  vector: number[],

  payload: any,
) {
  await client.upsert(
    COLLECTION,

    {
      points: [
        {
          id,

          vector,

          payload,
        },
      ],
    },
  );
}

/**
 * Elimina todos los vectores
 * asociados a un archivo.
 *
 * Ejemplo:
 *
 * src/app.ts
 *
 * elimina:
 *
 * chunk0
 * chunk1
 * chunk2
 *
 */
export async function deleteFileVectors(file: string) {
  await client.delete(
    COLLECTION,

    {
      filter: {
        must: [
          {
            key: "file",

            match: {
              value: file,
            },
          },
        ],
      },
    },
  );
}
