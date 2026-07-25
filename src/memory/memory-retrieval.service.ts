import { createEmbedding } from "../ai/ollama.service.js";

import { searchMemory } from "../qdrant/qdrant.service.js";

import { rankMemories } from "./memory-ranking.service.js";

import type { MemoryContext } from "./memory.types.js";

interface RetrievalOptions {
  project?: string;

  limit?: number;

  minScore?: number;
}

export async function retrieveMemoryContext(
  query: string,
  options: RetrievalOptions = {},
): Promise<MemoryContext> {
  const vector = await createEmbedding(query);

  const memories = await searchMemory(vector, {
    project: options.project,
  });

  const ranked = rankMemories(memories);

  const filtered = ranked
    .filter((item) => item.finalScore >= (options.minScore ?? 0.4))
    .slice(0, options.limit ?? 5);

  return {
    project: options.project ?? "global",

    query,

    memories: filtered.map((item) => item.memory),
  };
}
