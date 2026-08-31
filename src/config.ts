const DEFAULT_MEMORY_COLLECTION = "contextual_memory";

function requiredName(
  value: string | undefined,
  variable: string,
  fallback: string,
): string {
  const name = (value ?? fallback).trim();

  if (!name) {
    throw new Error(`${variable} must be a non-empty collection name`);
  }

  return name;
}

export function createConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    chatModel: "qwen2.5:14b",
    port: Number(env.PORT ?? 3000),
    ollamaUrl: env.OLLAMA_URL ?? "http://localhost:11434",
    qdrantUrl: env.QDRANT_URL ?? "http://localhost:6333",
    collection: requiredName(env.COLLECTION, "COLLECTION", "global_memory"),
    memoryCollection: requiredName(
      env.MEMORY_COLLECTION,
      "MEMORY_COLLECTION",
      DEFAULT_MEMORY_COLLECTION,
    ),
    embedModel: env.EMBED_MODEL ?? "nomic-embed-text",
  };
}

export const config = createConfig();
