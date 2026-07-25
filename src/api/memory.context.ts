import type { Request, Response } from "express";

import { retrieveMemoryContext } from "../memory/memory-retrieval.service.js";

export async function context(req: Request, res: Response) {
  const query = req.body.query ?? "";

  if (!query) {
    return res.json([]);
  }

  const context = await retrieveMemoryContext("memory-service", query);

  const content = context.memories
    .map((memory) => `- ${memory.text}`)
    .join("\n");

  return res.json([
    {
      name: "Global Memory",
      description: "Qdrant local memory",
      content,
    },
  ]);
}
