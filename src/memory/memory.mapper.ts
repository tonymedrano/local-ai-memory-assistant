import type { Memory } from "./memory.types.js";
import type { QdrantScoredPoint } from "./qdrant.types.js";

export function qdrantToMemory(point: QdrantScoredPoint): Memory {
  const payload = point.payload ?? {};

  return {
    id: String(point.id),

    text: String(payload.text ?? ""),

    type: payload.type as Memory["type"],

    project: typeof payload.project === "string" ? payload.project : undefined,

    importance: Number(payload.importance ?? 0.5),

    confidence: Number(payload.confidence ?? 0.8),

    accessCount: Number(payload.accessCount ?? 0),

    lastAccess: String(payload.lastAccess ?? ""),

    archived: Boolean(payload.archived ?? false),

    createdAt: String(payload.createdAt ?? ""),

    updatedAt: String(payload.updatedAt ?? ""),

    origin: String(payload.origin ?? "user"),
  };
}
