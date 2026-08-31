import { Router } from "express";

import { badRequest, internalError, notFound } from "../api/http.errors.js";
import { pathParameterSchema } from "../api/request.schemas.js";
import { MemoryIntelligenceService } from "./memory.intelligence.service.js";

const router = Router();

const service = new MemoryIntelligenceService();

router.get("/memory/:id/intelligence", async (req, res) => {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid memory id");
  }

  try {
    const result = await service.inspect(parsed.data);

    if (!result) {
      return notFound(res, "Memory not found");
    }

    return res.json(result);
  } catch (error) {
    return internalError(res, error, "[MemoryIntelligenceController]");
  }
});

export default router;
