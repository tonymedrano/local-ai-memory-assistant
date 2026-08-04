import { performance } from "node:perf_hooks";
import { randomUUID } from "crypto";
import type { TraceResult, TraceStep } from "./profiling.types.js";

export class Profiler {
  private readonly id = randomUUID();
  private readonly startedAt = new Date();
  private readonly startTime = performance.now();

  private readonly running = new Map<string, number>();
  private readonly steps: TraceStep[] = [];

  start(name: string): void {
    this.running.set(name, performance.now());
  }

  end(name: string): void {
    const start = this.running.get(name);

    if (start === undefined) {
      throw new Error(`Profiler step '${name}' was not started.`);
    }

    const end = performance.now();

    this.steps.push({
      name,
      duration: end - start,
    });

    this.running.delete(name);
  }

  async trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);

    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  summary(): TraceStep[] {
    return [...this.steps];
  }

  export(query?: string): TraceResult {
    const finishedAt = new Date();

    return {
      id: this.id,
      query,
      startedAt: this.startedAt,
      finishedAt,
      totalDuration: performance.now() - this.startTime,
      steps: [...this.steps],
    };
  }

  reset(): void {
    this.running.clear();
    this.steps.length = 0;
  }
}
