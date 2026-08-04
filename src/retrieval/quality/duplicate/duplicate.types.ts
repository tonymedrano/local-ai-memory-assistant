import type { QualityRankedResult } from "../quality.types.js";

export interface DuplicateMatch {
  sourceId?: string;
  duplicateId?: string;
  similarity: number;
}

export interface DuplicateDetectionResult {
  results: QualityRankedResult[];
  duplicatesRemoved: number;
  matches: DuplicateMatch[];
}
