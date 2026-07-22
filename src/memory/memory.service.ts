import { createEmbedding } from "../ai/ollama.service.js";

import { saveMemory, searchMemory } from "../qdrant/qdrant.service.js";

import type { Memory } from "./memory.types.js";

import { randomUUID } from "node:crypto";

export async function store(memory: Memory) {
  const vector = await createEmbedding(memory.text);

  await saveMemory(
    randomUUID(),

    vector,

    {
      ...memory,
      createdAt: new Date().toISOString(),
    },
  );
}

export async function recall(query: string) {
  const vector = await createEmbedding(query);

  return await searchMemory(vector);
}
