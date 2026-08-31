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

interface Params {
  id: string;
}

export function graph(req: Request, res: Response) {
  res.json(getGraph());
}

export function node(req: Request<Params>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  const result = getNode(parsed.data);

  return result ? res.json(result) : notFound(res, "Graph node not found");
}

export function neighbors(req: Request<Params>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  return res.json(getNeighbors(parsed.data));
}

export function stats(req: Request, res: Response) {
  res.json(getStats());
}

export function relations(req: Request<{ id: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  return res.json(getRelations(parsed.data));
}

export function incoming(req: Request<{ id: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph node id");
  }

  return res.json(getIncomingRelations(parsed.data));
}

export function search(req: Request<{ label: string }>, res: Response) {
  const parsed = pathParameterSchema.safeParse(req.params.label);

  if (!parsed.success) {
    return badRequest(res, "Invalid graph label");
  }

  const result = findNodeByLabel(parsed.data);

  return result ? res.json(result) : notFound(res, "Graph node not found");
}
