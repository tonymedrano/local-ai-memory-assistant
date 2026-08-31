import type { Memory } from "../../memory/memory.types.js";
import type { ContextModel } from "../../context/model/context.model.js";

export interface ContextAwareScoringInput {
  memory: Memory;
  context?: ContextModel;
}

export interface ContextScore {
  score: number;

  projectMatch: number;
  tagMatch: number;
  temporalMatch: number;
  memoryReference: number;
}