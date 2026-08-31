/**
 * Registry local del indexador.
 *
 * Guarda información sobre qué archivos
 * ya han sido procesados.
 *
 * Ejemplo:
 *
 * {
 *   "src/app.ts": {
 *      hash:"abc123",
 *      chunks:5,
 *      indexedAt:"2026-07-24"
 *   }
 * }
 *
 */

import { readJsonFile, writeJsonFileAtomic } from "../persistence/json.file.js";

const REGISTRY_FILE = ".indexer-registry.json";

/**
 * Información almacenada
 * por cada archivo.
 */
export interface RegistryEntry {
  // Hash del contenido
  hash: string;

  // Número de chunks generados
  chunks: number;

  // Fecha de indexación
  indexedAt: string;
}

/**
 * Registro completo.
 *
 * La clave es la ruta del archivo.
 */
export type Registry = Record<string, RegistryEntry>;

/**
 * Carga el registro existente.
 *
 * Si es la primera ejecución
 * devuelve un objeto vacío.
 */
export async function loadRegistry(): Promise<Registry> {
  return readJsonFile(REGISTRY_FILE, {});
}

/**
 * Guarda el estado actual
 * del indexador.
 */
export async function saveRegistry(registry: Registry) {
  await writeJsonFileAtomic(REGISTRY_FILE, registry);
}

/**
 * Elimina una entrada del registry.
 *
 * Se usa cuando un archivo ya no existe
 * físicamente en el proyecto.
 */
export function removeRegistryEntry(registry: Registry, file: string) {
  delete registry[file];
}
