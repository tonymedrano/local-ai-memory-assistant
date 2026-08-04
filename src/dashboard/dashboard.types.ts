export interface DashboardData {
  latency: {
    average: number;
    p50: number;
    p90: number;
    p99: number;
  };

  retrieval: {
    totalQueries: number;
    slowestStage?: string;
    slowestStageAverage: number;
  };

  stages: DashboardStage[];
}

export interface DashboardStage {
  name: string;
  averageDuration: number;
  percentage: number;
}