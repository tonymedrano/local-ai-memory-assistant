import { Router } from "express";

import { MetricsService } from "./metrics.service.js";

export function createMetricsController(metrics: MetricsService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const snapshot = await metrics.snapshot();

      res.json(snapshot);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Unable to load metrics",
      });
    }
  });

  router.delete("/", async (_req, res) => {
    try {
      await metrics.reset();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Unable to reset metrics",
      });
    }
  });

  return router;
}
