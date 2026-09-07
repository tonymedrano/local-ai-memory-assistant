import type { Request, Response } from "express";
import { recall, store } from "../core/container.js";
import { badRequest, internalError } from "./http.errors.js";
import { memorySchema, memorySearchSchema } from "./request.schemas.js";
import { tenantIdFromRequest } from "../security/tenant.js";

/**
 * Guarda una memoria contextual.
 *
 * Flujo:
 *
 * HTTP
 *  |
 * controller
 *  |
 * memory.service
 *  |
 * Ollama embedding
 *  |
 * Qdrant memory collection configured through MEMORY_COLLECTION
 */
export async function addMemory(req: Request, res: Response) {
  const parsed = memorySchema.safeParse(req.body);

  if (!parsed.success) {
    return badRequest(res, "Invalid memory payload");
  }

  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;

  try {
    const result = await store(parsed.data, tenantId);

    res.json(result);
  } catch (error) {
    return internalError(res, error, "[MemoryController] store");
  }
}

/**
 * Busca memoria contextual.
 *
 * Ejemplo:
 *
 * {
 *   query:"¿Qué base vectorial usamos?"
 * }
 */
export async function findMemory(req: Request, res: Response) {
  const parsed = memorySearchSchema.safeParse(req.body);

  if (!parsed.success) {
    return badRequest(res, "Invalid memory search payload");
  }

  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;

  try {
    const { query, options } = parsed.data;

    const result = await recall(query, options, tenantId);

    res.json(result);
  } catch (error) {
    return internalError(res, error, "[MemoryController] search");
  }
}
