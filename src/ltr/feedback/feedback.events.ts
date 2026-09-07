export enum FeedbackEventType {
  RESULT_RETURNED = "result_returned",
  MEMORY_SELECTED = "memory_selected",
  CONTEXT_USED = "context_used",
  ANSWER_ACCEPTED = "answer_accepted",
  ANSWER_REJECTED = "answer_rejected",
}

export interface FeedbackEvent {
  type: FeedbackEventType;
  query: string;
  memoryId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}