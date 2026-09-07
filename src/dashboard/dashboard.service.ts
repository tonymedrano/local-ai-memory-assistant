import { MetricsService } from "../metrics/metrics.service.js";
import type { DashboardData } from "./dashboard.types.js";

export class DashboardService {
  constructor(private readonly metrics: MetricsService) {}

  async getDashboard(): Promise<DashboardData> {
    const snapshot = await this.metrics.snapshot();

    const totalStageTime = snapshot.stageStats.reduce(
      (sum, stage) => sum + stage.averageDuration,
      0,
    );

    return {
      latency: {
        average: snapshot.averageLatency,
        p50: snapshot.p50,
        p90: snapshot.p90,
        p99: snapshot.p99,
      },

      retrieval: {
        totalQueries: snapshot.totalQueries,
        slowestStage: snapshot.stageStats[0]?.name,
        slowestStageAverage: snapshot.stageStats[0]?.averageDuration ?? 0,
      },

      stages: snapshot.stageStats.map((stage) => ({
        name: stage.name,
        averageDuration: stage.averageDuration,
        percentage:
          totalStageTime === 0
            ? 0
            : Number(
                ((stage.averageDuration / totalStageTime) * 100).toFixed(2),
              ),
      })),
    };
  }
}
