import type { FeatureVector } from "../features/feature.types.js";

export interface TrainingLabel extends FeatureVector {
  query: string;
  memoryId: string;
  label: number;
}
