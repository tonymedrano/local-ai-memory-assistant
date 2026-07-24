/**
 * Genera un hash SHA-256 del contenido
 * de un archivo.
 *
 * Este hash nos permite saber si un archivo
 * ha cambiado desde la última indexación.
 *
 * Ejemplo:
 *
 * archivo.ts
 *      |
 *      ▼
 * SHA-256
 *      |
 *      ▼
 * a83f92bd83....
 *
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";

/**
 * Calcula el hash del archivo.
 *
 * Si el contenido cambia,
 * el hash cambia.
 */
export async function fileHash(filePath: string): Promise<string> {
  // Leemos el archivo completo
  const content = await fs.readFile(filePath);

  // Generamos SHA-256
  return crypto.createHash("sha256").update(content).digest("hex");
}
