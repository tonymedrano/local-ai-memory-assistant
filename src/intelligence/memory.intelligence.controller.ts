import { Router } from "express";

import { MemoryIntelligenceService } from "./memory.intelligence.service.js";

const router = Router();

const service = new MemoryIntelligenceService();

router.get("/memory/:id/intelligence", async (req, res) => {
  const result = await service.inspect(req.params.id);

  if (!result) {
    return res.status(404).json({
      error: "Memory not found",
    });
  }

  res.json(result);
});

export default router;
