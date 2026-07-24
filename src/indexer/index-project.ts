/**
 * Orquestador del indexador.
 *
 * Flujo:
 *
 * 1. Buscar archivos
 * 2. Calcular hash
 * 3. Comparar con registry
 * 4. Saltar si no cambió
 * 5. Borrar vectores antiguos
 * 6. Crear embeddings
 * 7. Guardar en Qdrant
 * 8. Actualizar registry
 *
 */

import { scanDirectory } from "./scanner.js";

import { loadFile } from "./loaders/filesystem.loader.js";

import { chunkText } from "./chunker.js";

import { createEmbedding } from "./embedder.js";

import { uploadVector, deleteFileVectors } from "./uploader.js";

import { fileHash } from "./hash.js";

import {
  loadRegistry,
  saveRegistry,
  removeRegistryEntry,
} from "./file.registry.js";

import { ProjectRegistry } from "../projects/project.registry.js";

import { ProjectResolver } from "../projects/project.resolver.js";

import { v5 as uuidv5 } from "uuid";

/**
 * Namespace fijo para UUID v5.
 *
 * Mismo archivo + mismo chunk
 * siempre generan el mismo ID.
 */
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

async function indexProject(folder: string) {
  const projectRegistry = new ProjectRegistry();

  const resolver = new ProjectResolver(projectRegistry);

  const project = await resolver.resolve(folder);

  const collection = project.collection;

  const projectId = project.id;

  const files = await scanDirectory(folder);

  console.log(`Encontrados ${files.length} archivos`);

  const fileRegistry = await loadRegistry();
  /**
   * Lista de archivos actuales.
   */
  const currentFiles = new Set(files);

  /**
   * Detectar archivos desaparecidos.
   *
   * Están en registry pero no
   * en el proyecto actual.
   */
  for (const oldFile of Object.keys(fileRegistry)) {
    if (!currentFiles.has(oldFile)) {
      console.log(`Archivo eliminado: ${oldFile}`);

      await deleteFileVectors(collection, oldFile);

      removeRegistryEntry(fileRegistry, oldFile);
    }
  }

  for (const file of files) {
    const hash = await fileHash(file);

    const previous = fileRegistry[file];

    /**
     * Si existe y el hash coincide,
     * no hacemos nada.
     */
    if (previous && previous.hash === hash) {
      console.log(`Sin cambios: ${file}`);

      continue;
    }

    /**
     * Si existe pero cambió,
     * eliminamos la versión anterior
     * de Qdrant.
     */
    if (previous) {
      console.log(`Actualizando: ${file}`);

      await deleteFileVectors(collection, file);
    }

    console.log(`Indexando: ${file}`);

    const document = await loadFile(file);

    const chunks = chunkText(document.content);

    for (const chunk of chunks) {
      const vector = await createEmbedding(chunk.text);

      const id = uuidv5(
        `${file}-${chunk.index}`,

        UUID_NAMESPACE,
      );

      await uploadVector(
        collection,

        id,

        vector,

        {
          project: projectId,

          file,

          chunk: chunk.index,

          type: document.type,
        },
      );
    }

    // Actualizamos memoria local
    fileRegistry[file] = {
      hash,

      chunks: chunks.length,

      indexedAt: new Date().toISOString(),
    };
  }

  await saveRegistry(fileRegistry);

  console.log("Indexación completada");
}

indexProject(process.argv[2] ?? ".").catch((error) => {
  console.error(error);

  process.exit(1);
});
