import { Router } from "express";

import { FeedbackService } from "./feedback.service.js";

const router = Router();

const service = new FeedbackService();

router.post("/context/feedback", async (req, res) => {
  try {
    const { query, memories, feedback } = req.body;

    if (!query || !Array.isArray(memories)) {
      return res.status(400).json({
        error: "query and memories are required",
      });
    }

    if (feedback !== "positive" && feedback !== "negative") {
      return res.status(400).json({
        error: "feedback must be positive or negative",
      });
    }

    const created = await service.create({
      query,

      memories,

      feedback,

      createdAt: new Date(),
    });

    res.json(created);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create feedback",
    });
  }
});

router.get("/context/feedback/:memoryId", async (req, res) => {
  const result = service.getMemoryFeedback(req.params.memoryId);

  res.json(result);
});

export default router;
