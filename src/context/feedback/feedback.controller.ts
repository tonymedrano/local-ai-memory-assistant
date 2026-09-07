import { Router } from "express";

import { badRequest, internalError } from "../../api/http.errors.js";
import {
  contextFeedbackSchema,
  pathParameterSchema,
} from "../../api/request.schemas.js";
import { FeedbackService } from "./feedback.service.js";
import { tenantIdFromRequest } from "../../security/tenant.js";
import { notFound } from "../../api/http.errors.js";
import { memoryRepository } from "../../memory/memory.repository.instance.js";

export function createContextFeedbackRouter(service = new FeedbackService(), repository: Pick<typeof memoryRepository, "findById"> = memoryRepository): Router {
const router = Router();
router.post("/context/feedback", async (req, res) => {
  const parsed = contextFeedbackSchema.safeParse(req.body);

  if (!parsed.success) {
    return badRequest(res, "Invalid context feedback payload");
  }
  const tenantId = tenantIdFromRequest(req, res); if (!tenantId) return;

  try {
    const { query, memories, feedback } = parsed.data;

    const created = await service.create(tenantId, {
      query,

      memories,

      feedback,

      createdAt: new Date(),
    });

    res.json(created);
  } catch (error) {
    return internalError(res, error, "[ContextFeedbackController]");
  }
});

router.get("/context/feedback/:memoryId", async (req, res) => {
  const parsed = pathParameterSchema.safeParse(req.params.memoryId);

  if (!parsed.success) {
    return badRequest(res, "Invalid memory id");
  }
  const tenantId = tenantIdFromRequest(req, res); if (!tenantId) return;
  if (!await repository.findById(parsed.data, tenantId)) return notFound(res, "Memory not found");

  const result = service.getMemoryFeedback(tenantId, parsed.data);

  res.json(result);
});

return router;
}
export default createContextFeedbackRouter();
