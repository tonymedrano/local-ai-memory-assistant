import type { Request, Response } from "express";

import { buildContext } from "./context.service.js";

export async function context(req: Request, res: Response) {
  const query = req.body.query ?? "";

  if (!query) {
    return res.json({
      memories: [],
      knowledge: [],
      inference: [],
      explanations: [],
    });
  }

  const result = await buildContext(query);

  return res.json(result);
}
