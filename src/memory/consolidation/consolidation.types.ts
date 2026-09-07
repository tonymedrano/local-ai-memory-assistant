import type { Memory } from "../memory.types.js";

export interface ConsolidationResult {
  consolidated: boolean;
  memory?: Memory;
  sourceMemoryIds: string[];
  reason?: string;
}