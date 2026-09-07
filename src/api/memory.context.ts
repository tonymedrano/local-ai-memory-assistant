import type { Request, Response } from "express";

import { recall } from "../core/container.js";

export async function context(req: Request, res: Response) {
  const query = req.body.query ?? "";

  if (!query) {
    return res.json([]);
  }

  const results = await recall(query);

  const points = results ?? [];

  const content = points
    .map((item: any) => `- ${item.payload?.text}`)
    .join("\n");

  return res.json([
    {
      name: "Global Memory",
      description: "Qdrant local memory",
      content,
    },
  ]);
}
