import type { Memory } from "../../memory/memory.types.js";

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
}

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