import type { MetricsRepository } from "./metrics.types.js";

import type { TraceResult } from "../profiling/profiling.types.js";

export class InMemoryMetricsRepository implements MetricsRepository {
  private readonly traces: TraceResult[] = [];

  async add(trace: TraceResult): Promise<void> {
    this.traces.push(trace);
  }

  async getAll(): Promise<TraceResult[]> {
    return [...this.traces];
  }

  async getLatest(limit = 100): Promise<TraceResult[]> {
    if (limit <= 0) {
      return [];
    }

    return this.traces.slice(-limit);
  }

  async count(): Promise<number> {
    return this.traces.length;
  }

  async clear(): Promise<void> {
    this.traces.length = 0;
  }
}
