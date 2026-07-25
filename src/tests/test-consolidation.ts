// src/tests/test-consolidation.ts

import { createEmbedding } from "../ai/ollama.service.js";
import { MemoryType } from "../memory/memory.types.js";

import { searchSimilarMemories } from "../qdrant/qdrant.service.js";

async function main() {
  const text = "Usamos Qdrant como base vectorial local";

  console.log("Generando embedding...");

  const vector = await createEmbedding(text);

  console.log("Buscando memorias similares...");

  const result = await searchSimilarMemories(vector, {
    project: "memory-service",
    type: MemoryType.DECISION,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
