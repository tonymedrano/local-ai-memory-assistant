import type { Memory } from "../../memory/memory.types.js";

export interface RankedFeatures {
  memoryId: string;
  features: FeatureVector;
}

export interface FeatureMetrics {
  semantic?: number;
  bm25?: number;
  graphEvidence?: number;
  diversity?: number;
  duplicatePenalty?: number;

  // LTR feedback signal
  feedbackScore?: number;
}

export interface TrainingExample {
  query: string;
  memoryId: string;
  features: FeatureVector;
  label: number;
}

export interface FeatureInput {
  memory: Memory;
  metrics?: FeatureMetrics;
}

export interface FeatureVector {

  semantic: number;
  bm25: number;
  importance: number;
  confidence: number;
  freshness: number;
  graphEvidence: number;
  accessCount: number;
  diversity: number;
  duplicatePenalty: number;

  // LTR v2 features (optional during migration)
  feedbackScore?: number;
  retrievalFrequency?: number;
  ageScore?: number;
}

export interface LTRFeatures {
  // Retrieval
  vectorScore: number;
  keywordScore: number;
  hybridScore: number;

  // Memory quality
  importance: number;
  confidence: number;

  // Temporal
  freshness: number;

  // Usage
  accessCount: number;
  accessFrequency: number;

  // Learning
  feedbackScore: number;

  // Knowledge
  graphScore: number;

  // Penalties
  duplicatePenalty: number;
  redundancyPenalty: number;
}
