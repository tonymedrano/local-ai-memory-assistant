import { LearningEventType } from "./learning.types.js";

export interface LearningEvent {
  memoryId: string;
  event: LearningEventType;
  query?: string;
  currentScore: number;
}
