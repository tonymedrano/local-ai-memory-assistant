import express from "express";

import { addMemory, findMemory } from "./api/memory.controller.js";
import contextRoutes from "./context/context.routes.js";
import jobsRoutes from "./jobs-api/jobs.routes.js";
import graphRoutes from "./knowledge/graph/graph.routes.js";
import inferenceRoutes from "./knowledge/inference/inference.routes.js";
import resolutionRoutes from "./knowledge/resolution/resolution.routes.js";
import feedbackRoutes from "./knowledge/feedback/feedback.routes.js";
import { dashboardService, metricsService } from "./core/container.js";
import { memoryIntelligenceRouter } from "./intelligence/index.js";
import feedbackRouter from "./context/feedback/feedback.controller.js";
import { createMetricsController } from "./metrics/metrics.controller.js";
import { createDashboardController } from "./dashboard/dashboard.controller.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "memory-service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (_req, res) => {
  res.json({
    ready: true,
    service: "memory-service",
    timestamp: new Date().toISOString(),
  });
});

app.post("/memory", addMemory);
app.post("/memory/search", findMemory);

app.use("/", contextRoutes);
app.use("/jobs", jobsRoutes);
app.use("/knowledge/graph", graphRoutes);
app.use("/knowledge/inference", inferenceRoutes);
app.use("/knowledge/resolution", resolutionRoutes);
app.use("/knowledge/feedback", feedbackRoutes);
app.use("/metrics", createMetricsController(metricsService));
app.use("/dashboard", createDashboardController(dashboardService));
app.use(memoryIntelligenceRouter);
app.use(feedbackRouter);
