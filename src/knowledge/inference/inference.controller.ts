import type { Request, Response } from "express";

import { badRequest, notFound } from "../../api/http.errors.js";
import { pathParameterSchema } from "../../api/request.schemas.js";

import { inferenceRepository } from "./inference.repository.js";

import { explain } from "./explanation.engine.js";

import { detectConflicts } from "./conflict.engine.js";

export function getInference(req: Request, res: Response) {
  const subject = req.params.subject;

  if (subject !== undefined) {
    const parsed = pathParameterSchema.safeParse(subject);

    if (!parsed.success) {
      return badRequest(res, "Invalid inference subject");
    }

    return res.json(inferenceRepository.find(parsed.data));
  }

  return res.json(inferenceRepository.getAll());
}

export function getExplanation(req: Request, res: Response) {
  const subject = pathParameterSchema.safeParse(req.params.subject);
  const relation = pathParameterSchema.safeParse(req.params.relation);
  const object = pathParameterSchema.safeParse(req.params.object);

  if (!subject.success || !relation.success || !object.success) {
    return badRequest(res, "Invalid explanation parameters");
  }

  const result = explain(subject.data, relation.data, object.data);

  if (!result) {
    return notFound(res, "Explanation not found");
  }

  return res.json(result);
}

export function getConflicts(_req: Request, res: Response) {
  return res.json(detectConflicts());
}
