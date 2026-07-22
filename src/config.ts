import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),

  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",

  qdrantUrl: process.env.QDRANT_URL ?? "http://localhost:6333",

  collection: process.env.COLLECTION ?? "global_memory",

  embedModel: process.env.EMBED_MODEL ?? "nomic-embed-text",
};
