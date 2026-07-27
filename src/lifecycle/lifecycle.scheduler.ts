import { LifecycleService } from "./lifecycle.service.js";

const DAY = 24 * 60 * 60 * 1000;

export class LifecycleScheduler {
  constructor(private readonly lifecycle = new LifecycleService()) {}

  start(): void {
    console.log("[Lifecycle] Scheduler started.");

    this.execute();

    setInterval(() => {
      this.execute();
    }, DAY);
  }

  private async execute(): Promise<void> {
    try {
      await this.lifecycle.run();
    } catch (error) {
      console.error("[Lifecycle] Error:", error);
    }
  }
}
