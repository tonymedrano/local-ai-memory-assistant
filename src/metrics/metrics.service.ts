import type { TraceResult } from "../profiling/profiling.types.js";

import type {
  MetricsRepository,
  MetricsSnapshot,
  StageMetric,
} from "./metrics.types.js";

export class MetricsService {
  constructor(private readonly repository: MetricsRepository) {}

  async record(trace: TraceResult): Promise<void> {
    await this.repository.add(trace);
  }

  private round(value: number, decimals = 2): number {
    return Number(value.toFixed(decimals));
  }

  async snapshot(): Promise<MetricsSnapshot> {
    const traces = await this.repository.getAll();

    if (traces.length === 0) {
      return {
        totalQueries: 0,
        averageLatency: 0,
        p50: 0,
        p90: 0,
        p99: 0,
        stageStats: [],
      };
    }

    const latencies = traces.map((t) => t.totalDuration).sort((a, b) => a - b);

    const stageMap = new Map<string, number[]>();

    for (const trace of traces) {
      for (const step of trace.steps) {
        if (!stageMap.has(step.name)) {
          stageMap.set(step.name, []);
        }

        stageMap.get(step.name)!.push(step.duration);
      }
    }

    const stageStats: StageMetric[] = [];

    for (const [name, values] of stageMap) {
      stageStats.push({
        name,
        averageDuration: this.round(this.average(values)),
        minDuration: this.round(Math.min(...values)),
        maxDuration: this.round(Math.max(...values)),
        executions: values.length,
      });
    }

    stageStats.sort((a, b) => b.averageDuration - a.averageDuration);

    return {
      totalQueries: traces.length,
      averageLatency: this.round(this.average(latencies)),
      p50: this.percentile(latencies, 50),
      p90: this.percentile(latencies, 90),
      p99: this.percentile(latencies, 99),
      stageStats,
    };
  }

  async reset(): Promise<void> {
    await this.repository.clear();
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private percentile(values: number[], percentile: number): number {
    if (values.length === 0) {
      return 0;
    }

    const index = Math.ceil((percentile / 100) * values.length) - 1;

    return values[Math.max(0, index)];
  }
}
