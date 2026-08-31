import type { Request, Response } from "express";

import { badRequest } from "../../api/http.errors.js";
import { pathParameterSchema } from "../../api/request.schemas.js";
import { feedbackStorage } from "./feedback.storage.js";

export function getFeedback(req: Request, res: Response) {
  res.json(feedbackStorage.getAll());
}

export function getFeedbackByKnowledge(req: Request, res: Response) {
  const id = pathParameterSchema.safeParse(req.params.id);

  if (!id.success) {
    return badRequest(res, "Invalid knowledge id");
  }

  const result = feedbackStorage
    .getAll()
    .filter((item) => item.knowledgeId === id.data);

  res.json(result);
}
