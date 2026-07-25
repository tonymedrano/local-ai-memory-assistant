import type { Request, Response } from "express";

import { store, recall } from "../memory/memory.service.js";

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
 * Qdrant contextual_memory
 */
export async function addMemory(req: Request, res: Response) {
  try {
    const memory = req.body;

    const result = await store(memory);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error storing memory",
    });
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
  try {
    const { query, options } = req.body;

    const result = await recall(query, options);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error searching memory",
    });
  }
}
