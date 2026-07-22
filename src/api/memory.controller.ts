import type { Request, Response } from "express";

import { createEmbedding } from "../ai/ollama.service.js";

import { saveMemory, searchMemory } from "../qdrant/qdrant.service.js";

export async function addMemory(req: Request, res: Response) {
  const { id, text, metadata } = req.body;

  const vector = await createEmbedding(text);

  await saveMemory(id, vector, {
    text,
    ...metadata,
  });

  res.json({
    ok: true,
  });
}

export async function findMemory(req: Request, res: Response) {
  const { query } = req.body;

  const vector = await createEmbedding(query);

  const result = await searchMemory(vector);

  res.json(result);
}
