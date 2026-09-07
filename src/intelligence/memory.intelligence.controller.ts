import { Router } from "express";

import { badRequest, internalError, notFound } from "../api/http.errors.js";
import { pathParameterSchema } from "../api/request.schemas.js";
import { MemoryIntelligenceService } from "./memory.intelligence.service.js";
import { tenantIdFromRequest } from "../security/tenant.js";

export function createMemoryIntelligenceRouter(service = new MemoryIntelligenceService()): Router {
const router = Router();
router.get("/memory/:id/intelligence", async (req, res) => {
  const parsed = pathParameterSchema.safeParse(req.params.id);

  if (!parsed.success) {
    return badRequest(res, "Invalid memory id");
  }
  const tenantId = tenantIdFromRequest(req, res);
  if (!tenantId) return;

  try {
    const result = await service.inspect(tenantId, parsed.data);

    if (!result) {
      return notFound(res, "Memory not found");
    }

    return res.json(result);
  } catch (error) {
    return internalError(res, error, "[MemoryIntelligenceController]");
  }
});

return router;
}
export default createMemoryIntelligenceRouter();
