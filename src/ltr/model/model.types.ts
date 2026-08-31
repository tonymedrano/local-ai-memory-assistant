export interface LinearWeights {
  semantic: number;
  bm25: number;
  importance: number;
  confidence: number;
  freshness: number;
  graphEvidence: number;
  accessCount: number;
  diversity: number;
  duplicatePenalty: number;

  feedbackScore: number;
  retrievalFrequency: number;
  ageScore: number;
  contextScore: number;
}

export interface StoredModel {
  version: number;
  trainedAt: string;
  samples: number;
  weights: LinearWeights;
}
