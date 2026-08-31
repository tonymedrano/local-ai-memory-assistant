import { Router } from "express";

import { internalError } from "../api/http.errors.js";
import { DashboardService } from "./dashboard.service.js";

export function createDashboardController(dashboard: DashboardService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const data = await dashboard.getDashboard();

      res.json(data);
    } catch (error) {
      return internalError(res, error, "[DashboardController]");
    }
  });

  return router;
}
