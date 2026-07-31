export const config = {
  chatModel: "qwen2.5:14b",
  port: Number(process.env.PORT ?? 3000),
  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
  qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",
  collection: process.env.COLLECTION ?? "global_memory",
  memoryCollection: process.env.MEMORY_COLLECTION ?? "contextual_memory",
  embedModel: process.env.EMBED_MODEL ?? "nomic-embed-text",
};
