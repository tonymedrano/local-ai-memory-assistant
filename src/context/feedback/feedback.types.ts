export type FeedbackType = "positive" | "negative";

export interface ContextFeedback {
  id?: string;
  query: string;
  memories: string[];
  feedback: FeedbackType;
  createdAt: Date;
  tenantId: string;
}
