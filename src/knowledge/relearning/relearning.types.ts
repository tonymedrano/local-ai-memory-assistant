export type RelearningDecision = "boost" | "weaken" | "mark-uncertain";

export interface RelearningResult {
  knowledgeId: string;
  decision: RelearningDecision;
  reason: string;
  createdAt: Date;
}
