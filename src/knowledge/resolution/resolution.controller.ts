import type { Request, Response } from "express";

import { badRequest } from "../../api/http.errors.js";
import { pathParameterSchema } from "../../api/request.schemas.js";
import { resolutionStorage } from "./resolution.storage.js";

export function getResolutions(req: Request, res: Response) {
  res.json(resolutionStorage.getAll());
}

export function getResolutionBySubject(req: Request, res: Response) {
  const subject = pathParameterSchema.safeParse(req.params.subject);

  if (!subject.success) {
    return badRequest(res, "Invalid subject parameter");
  }

  return res.json(resolutionStorage.findBySubject(subject.data));
}
