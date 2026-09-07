import type { RankedResult } from "../reranker.types.js";

export interface QualityScore {
  relevance: number;
  confidence: number;
  importance: number;
  freshness: number;
  diversity: number;
  redundancyPenalty: number;
  finalScore: number;
}

export interface QualityRankedResult extends RankedResult {
  qualityScore: QualityScore;
}

export interface QualityWeights {
  relevance: number;
  confidence: number;
  importance: number;
  freshness: number;
  diversity: number;
}

export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
  relevance: 0.45,
  confidence: 0.2,
  importance: 0.15,
  freshness: 0.1,
  diversity: 0.1,
};
