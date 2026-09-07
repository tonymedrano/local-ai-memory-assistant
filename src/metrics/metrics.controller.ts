import { Router } from "express";

import { internalError } from "../api/http.errors.js";
import { MetricsService } from "./metrics.service.js";

export function createMetricsController(metrics: MetricsService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const snapshot = await metrics.snapshot();

      res.json(snapshot);
    } catch (error) {
      return internalError(res, error, "[MetricsController] snapshot");
    }
  });

  router.delete("/", async (_req, res) => {
    try {
      await metrics.reset();

      res.json({
        success: true,
      });
    } catch (error) {
      return internalError(res, error, "[MetricsController] reset");
    }
  });

  return router;
}
