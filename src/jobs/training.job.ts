import { trainingService } from "../core/container.js";

export async function trainingJob(): Promise<void> {
  console.log("[LTR] Training started");

  const start = Date.now();

  await trainingService.train();

  console.log(
    "[LTR] Training finished in",
    Date.now() - start,
    "ms",
  );
}