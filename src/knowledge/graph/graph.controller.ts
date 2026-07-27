import type { Request, Response } from "express";

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
  const result = getNode(req.params.id);

  res.json(result ?? null);
}

export function neighbors(req: Request<Params>, res: Response) {
  res.json(getNeighbors(req.params.id));
}

export function stats(req: Request, res: Response) {
  res.json(getStats());
}

export function relations(req: Request<{ id: string }>, res: Response) {
  res.json(getRelations(req.params.id));
}

export function incoming(req: Request<{ id: string }>, res: Response) {
  res.json(getIncomingRelations(req.params.id));
}

export function search(req: Request<{ label: string }>, res: Response) {
  const result = findNodeByLabel(req.params.label);

  res.json(result ?? null);
}
