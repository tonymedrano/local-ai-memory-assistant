import express from "express";

import { config } from "./config.js";

import {
  initCollection,
  initMemoryCollection,
} from "./qdrant/qdrant.service.js";

import { addMemory, findMemory } from "./api/memory.controller.js";
import { context } from "./api/memory.context.js";
import { LifecycleScheduler } from "./lifecycle/lifecycle.scheduler.js";
import { startScheduler } from "./jobs/index.js";

const app = express();

app.use(express.json());

app.post("/memory", addMemory);

app.post("/memory/search", findMemory);

app.post("/context", context);

Promise.all([initCollection(), initMemoryCollection()])
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Memory service running on port ${config.port}`);
    });

    const scheduler = new LifecycleScheduler();
    scheduler.start();
    startScheduler();
  })
  .catch((error) => {
    console.error("Failed to initialize memory service:");

    console.error(JSON.stringify(error, null, 2));

    console.error(error?.stack);

    process.exit(1);
  });
