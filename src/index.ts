import { config } from "./config.js";

import {
  initCollection,
  initMemoryCollection,
} from "./qdrant/qdrant.service.js";

import { startScheduler } from "./jobs/index.js";
import { initLearning, keywordIndexLoader } from "./core/container.js";

import { app } from "./app.js";

Promise.all([initCollection(), initMemoryCollection(), initLearning()])
  .then(async () => {
    await keywordIndexLoader.load();

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
