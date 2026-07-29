import type { Request, Response } from "express";

import { inferenceRepository } from "./inference.repository.js";

import { explain } from "./explanation.engine.js";

import { detectConflicts } from "./conflict.engine.js";

export function getInference(req: Request, res: Response) {
  const subject = String(req.params.subject);

  if (subject) {
    return res.json(inferenceRepository.find(subject));
  }

  return res.json(inferenceRepository.getAll());
}

export function getExplanation(req: Request, res: Response) {
  const subject = String(req.params.subject);

  const relation = String(req.params.relation);

  const object = String(req.params.object);

  const result = explain(subject, relation, object);

  if (!result) {
    return res.status(404).json({
      error: "Explanation not found",
    });
  }

  return res.json(result);
}

export function getConflicts(_req: Request, res: Response) {
  return res.json(detectConflicts());
}
