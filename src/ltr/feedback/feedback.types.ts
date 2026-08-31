import type { FeatureVector } from "../features/feature.types.js";

export enum FeedbackType {
  IMPRESSION = "impression",
  CLICK = "click",
  ACCEPT = "accept",
  REJECT = "reject",
  IGNORE = "ignore",
}

export function isTrainableFeedback(type: FeedbackType): boolean {
  return (
    type === FeedbackType.CLICK ||
    type === FeedbackType.ACCEPT ||
    type === FeedbackType.REJECT
  );
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
