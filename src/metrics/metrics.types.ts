import type { TraceResult } from "../profiling/profiling.types.js";

export interface MetricsSnapshot {
  totalQueries: number;
  averageLatency: number;
  p50: number;
  p90: number;
  p99: number;
  stageStats: StageMetric[];
}

export interface StageMetric {
  name: string;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  executions: number;
}

export interface MetricsRepository {
  add(trace: TraceResult): Promise<void>;
  getAll(): Promise<TraceResult[]>;
  clear(): Promise<void>;
}

interface StoredStageMetric {
  name: string;
  duration: number;
  order: number;
}
