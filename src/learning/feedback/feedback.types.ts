export enum FeedbackLabel {
  Ignored = 0,
  Accepted = 1,
}

export interface FeedbackRecord {
  query: string;
  memoryId: string;
  label: FeedbackLabel;
  timestamp: string;
}
