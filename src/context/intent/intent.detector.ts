import type { ContextIntent } from "./intent.types.js";

export class IntentDetector {
  detect(query: string): ContextIntent {
    const text = query.toLowerCase();

    if (
      text.includes("por qué") ||
      text.includes("porque") ||
      text.includes("razón")
    ) {
      return "decision";
    }

    if (
      text.includes("arquitectura") ||
      text.includes("estructura") ||
      text.includes("diseño")
    ) {
      return "architecture";
    }

    if (
      text.includes("error") ||
      text.includes("falla") ||
      text.includes("problema")
    ) {
      return "debug";
    }

    if (
      text.includes("cómo") ||
      text.includes("como") ||
      text.includes("implementamos")
    ) {
      return "implementation";
    }

    if (text.includes("explica") || text.includes("qué significa")) {
      return "explanation";
    }

    return "general";
  }
}
