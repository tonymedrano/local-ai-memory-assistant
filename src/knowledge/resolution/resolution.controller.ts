import type { Request, Response } from "express";

import { resolutionStorage } from "./resolution.storage.js";

export function getResolutions(req: Request, res: Response) {
  res.json(resolutionStorage.getAll());
}

export function getResolutionBySubject(req: Request, res: Response) {
  const subject = req.params.subject;

  if (typeof subject !== "string") {
    return res.status(400).json({
      error: "Invalid subject parameter",
    });
  }

  res.json(resolutionStorage.findBySubject(subject));
}
