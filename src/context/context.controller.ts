import type { Request, Response } from "express";

import { buildContext } from "./context.service.js";

export async function context(req: Request, res: Response) {
  const query = req.body.query ?? "";

  if (!query) {
    return res.status(400).json({
      error: "Query required",
    });
  }

  try {
    const result = await buildContext(query);

    return res.json(result);
  } catch (error) {
    console.error("[ContextController]", error);

    return res.status(500).json({
      error: "Context generation failed",
    });
  }
}
