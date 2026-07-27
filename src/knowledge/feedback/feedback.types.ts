export type FeedbackAction = "boost" | "weaken" | "mark-uncertain";

export interface KnowledgeFeedback {
  knowledgeId: string;

  action: FeedbackAction;

  previousConfidence: number;

  newConfidence: number;

  reason: string;

  createdAt: string;
}
