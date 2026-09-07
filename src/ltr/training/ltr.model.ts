export interface LTRFeatures {
  semantic: number;
  bm25: number;
  importance: number;
}

export interface LTRWeights {
  semantic: number;
  bm25: number;
  importance: number;
}

export interface LTRModel {
  predict(features: LTRFeatures): number;

  getWeights(): LTRWeights;
}
