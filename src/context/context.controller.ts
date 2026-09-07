import type { Request, Response } from "express";

import { badRequest, internalError } from "../api/http.errors.js";
import { contextRequestSchema } from "../api/request.schemas.js";
import { buildContext } from "./context.service.js";
import { tenantIdFromRequest } from "../security/tenant.js";

export async function context(req: Request, res: Response) {
  const parsed = contextRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return badRequest(res, "Invalid context payload");
  }

  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;

  try {
    const result = await buildContext(parsed.data.query, tenantId);

    return res.json(result);
  } catch (error) {
    return internalError(res, error, "[ContextController]");
  }
}
