export interface TrainingExample {
  query: string;

  memoryId: string;

  features: Record<string, number>;

  label: number;
}
