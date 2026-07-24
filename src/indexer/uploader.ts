/**
 * Comunicación con Qdrant.
 *
 * Aquí:
 *
 * - Insertamos vectores
 * - Eliminamos vectores antiguos
 *
 * La colección ahora es dinámica.
 *
 * Cada proyecto tiene su propia colección:
 *
 * project_memory_service
 * project_angular_kpi
 * project_flutter_ohms
 *
 */

import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: "http://localhost:6333",

  checkCompatibility: false,
});

/**
 * Guarda un vector en Qdrant.
 */
export async function uploadVector(
  collection: string,

  id: string,

  vector: number[],

  payload: any,
) {
  await client.upsert(
    collection,

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
export async function deleteFileVectors(
  collection: string,

  file: string,
) {
  await client.delete(
    collection,

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
