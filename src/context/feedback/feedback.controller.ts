import { Router } from "express";

import { badRequest, internalError } from "../../api/http.errors.js";
import {
  contextFeedbackSchema,
  pathParameterSchema,
} from "../../api/request.schemas.js";
import { FeedbackService } from "./feedback.service.js";

const router = Router();

const service = new FeedbackService();

router.post("/context/feedback", async (req, res) => {
  const parsed = contextFeedbackSchema.safeParse(req.body);

  if (!parsed.success) {
    return badRequest(res, "Invalid context feedback payload");
  }

  try {
    const { query, memories, feedback } = parsed.data;

    const created = await service.create({
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

  const result = service.getMemoryFeedback(parsed.data);

  res.json(result);
});

export default router;
