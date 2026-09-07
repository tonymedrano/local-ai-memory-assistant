import type { Request, Response } from "express";

import { badRequest, notFound } from "../../api/http.errors.js";
import { pathParameterSchema } from "../../api/request.schemas.js";

import {
  getGraph,
  getStats,
  getNode,
  getNeighbors,
  getRelations,
  getIncomingRelations,
  findNodeByLabel,
} from "./graph.service.js";
import { tenantIdFromRequest } from "../../security/tenant.js";
import { tenantGraphScope } from "./graph.types.js";

function scope(req: Request<any>, res: Response) {
  const tenantId = tenantIdFromRequest(req, res);
  return tenantId ? tenantGraphScope(tenantId) : undefined;
}

interface Params {
  id: string;
}

export function graph(req: Request, res: Response) {
  const currentScope = scope(req, res); if (!currentScope) return;
  res.json(getGraph(currentScope));
}

export function node(req: Request<Params>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  const currentScope = scope(req, res); if (!currentScope) return;
  const result = getNode(currentScope, parsed.data);

  return result ? res.json(result) : notFound(res, "Graph node not found");
}

export function neighbors(req: Request<Params>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  const currentScope = scope(req, res); if (!currentScope) return;
  return res.json(getNeighbors(currentScope, parsed.data));
}

export function stats(req: Request, res: Response) {
  const currentScope = scope(req, res); if (!currentScope) return;
  res.json(getStats(currentScope));
}

export function relations(req: Request<{ id: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  const currentScope = scope(req, res); if (!currentScope) return;
  return res.json(getRelations(currentScope, parsed.data));
}

export function incoming(req: Request<{ id: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  const currentScope = scope(req, res); if (!currentScope) return;
  return res.json(getIncomingRelations(currentScope, parsed.data));
}

export function search(req: Request<{ label: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.label);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph label");
  }

  const currentScope = scope(req, res); if (!currentScope) return;
  const result = findNodeByLabel(currentScope, parsed.data);

  return result ? res.json(result) : notFound(res, "Graph node not found");
}
