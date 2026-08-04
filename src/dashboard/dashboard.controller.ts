import { Router } from "express";

import { DashboardService } from "./dashboard.service.js";

export function createDashboardController(dashboard: DashboardService): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const data = await dashboard.getDashboard();

      res.json(data);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Unable to load dashboard",
      });
    }
  });

  return router;
}
