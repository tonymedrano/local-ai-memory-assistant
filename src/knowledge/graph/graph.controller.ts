import type { Request, Response } from "express";

import { getGraph, getNode, getNeighbors, getStats } from "./graph.service.js";

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
