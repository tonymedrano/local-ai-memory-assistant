export enum LearningEventType {
  CONTEXT_USED = "context_used",
  CONTEXT_IGNORED = "context_ignored",
  ANSWER_ACCEPTED = "answer_accepted",
  ANSWER_REJECTED = "answer_rejected",
  USER_CORRECTION = "user_correction",
}

export interface ContextLearning {
  id: string;
  memoryId: string;
  event: LearningEventType;
  query?: string;
  scoreBefore: number;
  scoreAfter: number;
  weight: number;
  createdAt: Date;
}
