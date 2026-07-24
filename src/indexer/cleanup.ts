/**
 * Limpieza de vectores huérfanos.
 *
 * Un vector es huérfano cuando:
 *
 * - Existe en Qdrant
 * - Pero el archivo original ya no existe
 *
 */

import { scanDirectory } from "./scanner.js";

import { getProjectFiles, deleteFileVectors } from "./uploader.js";

import { ProjectRegistry } from "../projects/project.registry.js";

import { ProjectResolver } from "../projects/project.resolver.js";

export async function cleanupProject(folder: string) {
  const projectRegistry = new ProjectRegistry();

  const resolver = new ProjectResolver(projectRegistry);

  const project = await resolver.resolve(folder);

  const collection = project.collection;

  const projectId = project.id;

  console.log(`\nLimpieza proyecto: ${project.name}`);

  /**
   * Archivos actuales en disco
   */
  const diskFiles = await scanDirectory(folder);

  const diskSet = new Set(diskFiles);

  /**
   * Archivos conocidos por Qdrant
   */
  const vectors = await getProjectFiles(collection);
  console.log(
  "Archivos en Qdrant:"
);

console.log(
  vectors.map(
    v => v.file
  )
);

  const qdrantFiles = new Set(vectors.map((v) => v.file));

  const orphaned = [...qdrantFiles].filter((file) => !diskSet.has(file));

  console.log(`Vectores huérfanos: ${orphaned.length}`);

  for (const file of orphaned) {
    console.log(`Eliminando: ${file}`);

    await deleteFileVectors(
      collection,

      projectId,

      file,
    );
  }

  console.log("Limpieza completada");
}
