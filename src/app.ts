import express from "express";
import { Router } from "express";
import { errorHandler, notFoundHandler } from "./api/http.errors.js";

import { addMemory, findMemory } from "./api/memory.controller.js";
import contextRoutes from "./context/context.routes.js";
import jobsRoutes from "./jobs-api/jobs.routes.js";
import graphRoutes from "./knowledge/graph/graph.routes.js";
import inferenceRoutes from "./knowledge/inference/inference.routes.js";
import resolutionRoutes from "./knowledge/resolution/resolution.routes.js";
import feedbackRoutes from "./knowledge/feedback/feedback.routes.js";
import { dashboardService, memoryRepository, metricsService } from "./core/container.js";
import { createMemoryIntelligenceRouter } from "./intelligence/memory.intelligence.controller.js";
import { MemoryIntelligenceService } from "./intelligence/memory.intelligence.service.js";
import { createContextFeedbackRouter } from "./context/feedback/feedback.controller.js";
import { FeedbackService } from "./context/feedback/feedback.service.js";
import { FeedbackRepository } from "./context/feedback/feedback.repository.js";
import { createMetricsController } from "./metrics/metrics.controller.js";
import { createDashboardController } from "./dashboard/dashboard.controller.js";
import { readinessService } from "./readiness/readiness.service.js";
import { systemAuthentication, tenantAuthentication } from "./security/tenant.js";

export function createApp(options: { memoryRepository?: Pick<typeof memoryRepository, "findById" | "update"> } = {}) {
const app = express();
const scopedMemoryRepository = options.memoryRepository ?? memoryRepository;

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "memory-service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", async (_req, res) => {
  const readiness = await readinessService.getStatus();
  res.status(readiness.ready ? 200 : 503).json(readiness);
});

// Explicit public allowlist. Every other mounted production route is either
// tenant-authenticated or blocked pending a real system/admin authenticator.
const tenantRouter = Router();
tenantRouter.post("/memory", addMemory);
tenantRouter.post("/memory/search", findMemory);
tenantRouter.use("/", contextRoutes);
tenantRouter.use("/knowledge/graph", graphRoutes);
tenantRouter.use("/knowledge/inference", inferenceRoutes);
tenantRouter.use(createMemoryIntelligenceRouter(new MemoryIntelligenceService(scopedMemoryRepository)));
tenantRouter.use(createContextFeedbackRouter(new FeedbackService(new FeedbackRepository(), scopedMemoryRepository), scopedMemoryRepository));
app.use(tenantAuthentication, tenantRouter);

// These routers expose global operational or legacy-global state. They are
// fail-closed until a dedicated system authentication mechanism exists.
const systemRouter = Router();
systemRouter.use("/jobs", jobsRoutes);
systemRouter.use("/knowledge/resolution", resolutionRoutes);
systemRouter.use("/knowledge/feedback", feedbackRoutes);
systemRouter.use("/metrics", createMetricsController(metricsService));
systemRouter.use("/dashboard", createDashboardController(dashboardService));
app.use(systemAuthentication, systemRouter);
app.use(notFoundHandler);
app.use(errorHandler);
return app;
}

export const app = createApp();
