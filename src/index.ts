import express from "express";

import { config } from "./config.js";

import {
  initCollection,
  initMemoryCollection,
} from "./qdrant/qdrant.service.js";

import { addMemory, findMemory } from "./api/memory.controller.js";
import contextRoutes from "./context/context.routes.js";
import { startScheduler } from "./jobs/index.js";
import jobsRoutes from "./jobs-api/jobs.routes.js";
import graphRoutes from "./knowledge/graph/graph.routes.js";
import inferenceRoutes from "./knowledge/inference/inference.routes.js";
import resolutionRoutes from "./knowledge/resolution/resolution.routes.js";
import feedbackRoutes from "./knowledge/feedback/feedback.routes.js";

const app = express();

app.use(express.json());
app.post("/memory", addMemory);
app.post("/memory/search", findMemory);
app.use("/", contextRoutes);
app.use("/jobs", jobsRoutes);
app.use("/knowledge/graph", graphRoutes);
app.use("/knowledge/inference", inferenceRoutes);
app.use("/knowledge/resolution", resolutionRoutes);
app.use("/knowledge/feedback", feedbackRoutes);

Promise.all([initCollection(), initMemoryCollection()])
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Memory service running on port ${config.port}`);
    });

    startScheduler();
  })
  .catch((error) => {
    console.error("Failed to initialize memory service:");
    console.error(JSON.stringify(error, null, 2));
    console.error(error?.stack);
    process.exit(1);
  });
