import type { FeatureVector } from "../features/feature.types.js";
export type FeedbackScope = { kind: "tenant"; tenantId: string } | { kind: "system" } | { kind: "legacy-unowned" };

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
  scope: FeedbackScope;
  query: string;
  memoryId: string;
  type: FeedbackType;
  signal: number;
  features: FeatureVector;
  createdAt: Date;
}
