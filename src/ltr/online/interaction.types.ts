export type InteractionType =
  | "impression"
  | "click"
  | "open"
  | "copy"
  | "favorite"
  | "ignore";

export interface InteractionEvent {
  query: string;
  memoryId: string;
  rank: number;
  score: number;
  interaction: InteractionType;
  timestamp: string;
}