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

export interface TrainingExample {
  query: string;
  memoryId: string;
  features: FeatureVector;
  label: number;
}