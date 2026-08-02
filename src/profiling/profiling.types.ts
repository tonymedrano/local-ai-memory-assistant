export interface TraceStep {
  name: string;
  duration: number;
}

export interface TraceResult {
  id: string;
  query?: string;
  startedAt: Date;
  finishedAt: Date;
  totalDuration: number;
  steps: TraceStep[];
}
