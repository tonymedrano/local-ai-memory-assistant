import type { Request, Response } from "express";

import { badRequest, notFound } from "../../api/http.errors.js";
import { pathParameterSchema } from "../../api/request.schemas.js";

import { inferenceRepository } from "./inference.repository.js";

import { explain } from "./explanation.engine.js";

import { detectConflicts } from "./conflict.engine.js";
import { tenantIdFromRequest } from "../../security/tenant.js";
import { tenantGraphScope } from "../graph/graph.types.js";

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
  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;
  const scope = tenantGraphScope(tenantId);
  const subject = pathParameterSchema.safeParse(req.params.subject);
  const relation = pathParameterSchema.safeParse(req.params.relation);
  const object = pathParameterSchema.safeParse(req.params.object);

  if (!subject.success || !relation.success || !object.success) {
    return badRequest(res, "Invalid explanation parameters");
  }

  const result = explain(scope, subject.data, relation.data, object.data);

  if (!result) {
    return notFound(res, "Explanation not found");
  }

  return res.json(result);
}

export function getConflicts(req: Request, res: Response) {
  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;
  return res.json(detectConflicts(tenantGraphScope(tenantId)));
}
