import type { Request, Response } from "express";

import { feedbackStorage } from "./feedback.storage.js";

export function getFeedback(req: Request, res: Response) {
  res.json(feedbackStorage.getAll());
}

export function getFeedbackByKnowledge(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      error: "Invalid knowledge id",
    });
  }

  const result = feedbackStorage
    .getAll()
    .filter((item) => item.knowledgeId === id);

  res.json(result);
}
