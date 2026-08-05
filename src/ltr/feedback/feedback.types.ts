import type { FeatureVector } from "../features/feature.types.js";

export enum FeedbackType {
  CLICK = "click",
  ACCEPT = "accept",
  REJECT = "reject",
  IGNORE = "IGNORE",
}

export interface RankingFeedback {
  id: string;
  query: string;
  memoryId: string;
  type: FeedbackType;
  signal: number;
  features: FeatureVector;
  createdAt: Date;
}