import { Profiler } from "./profiler.js";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  const profiler = new Profiler();

  await profiler.trace("Embedding", async () => {
    await sleep(50);
  });

  await profiler.trace("Vector Search", async () => {
    await sleep(25);
  });

  await profiler.trace("Keyword Search", async () => {
    await sleep(8);
  });

  await profiler.trace("Fusion", async () => {
    await sleep(2);
  });

  const summary = profiler.summary();

  if (summary.length !== 4) {
    throw new Error("Expected 4 profiling steps.");
  }

  if (profiler.export().totalDuration <= 0) {
    throw new Error("Total duration should be greater than zero.");
  }

  console.log("\n✅ Profiler test passed.");

  console.log("\nExport:");
  console.dir(profiler.export("Angular Native Federation"), {
    depth: null,
  });
}

run().catch(console.error);
