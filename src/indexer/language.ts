/**
 * Detecta el lenguaje del archivo
 * para almacenarlo como metadata
 * en Qdrant.
 */

import path from "node:path";

import type { Language } from "./uploader.js";

export function detectLanguage(file: string): Language {
  const ext = path.extname(file).toLowerCase();

  switch (ext) {
    case ".ts":
    case ".tsx":
      return "typescript";

    case ".js":
    case ".jsx":
      return "javascript";

    case ".java":
      return "java";

    case ".py":
      return "python";

    case ".dart":
      return "dart";

    case ".md":
      return "markdown";

    case ".json":
      return "json";

    default:
      return "text";
  }
}
