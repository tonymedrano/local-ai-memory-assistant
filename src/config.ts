import dotenv from "dotenv";

dotenv.config();


export const config = {

  port:
    Number(process.env.PORT ?? 3000),


  ollamaUrl:
    process.env.OLLAMA_URL ??
    "http://localhost:11434",


  qdrantUrl:
    process.env.QDRANT_URL ??
    "http://localhost:6333",


  /**
   * Colección usada por el indexador
   * de proyectos.
   *
   * Contiene:
   * - archivos
   * - chunks
   * - código
   * - documentación
   */
  collection:
    process.env.COLLECTION ??
    "global_memory",



  /**
   * Colección dedicada a memoria contextual.
   *
   * Contiene:
   * - decisiones
   * - hechos
   * - soluciones
   * - conocimiento persistente
   */
  memoryCollection:
    process.env.MEMORY_COLLECTION ??
    "contextual_memory",



  embedModel:
    process.env.EMBED_MODEL ??
    "nomic-embed-text",

};