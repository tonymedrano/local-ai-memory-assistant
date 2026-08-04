export interface LTRModel {

  predict(features: {
    semantic: number;
    bm25: number;
    importance: number;
  }): number;

}