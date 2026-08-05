export interface OnlineModel {
  weights: Record<string, number>;

  learningRate: number;

  updates: number;

  createdAt: string;

  updatedAt: string;
}
