import type { FeatureVector } from "../features/feature.types.js";
import type { LinearWeights } from "./model.types.js";

export interface LTRModel {
  predict(features: FeatureVector): number;

  getWeights(): LinearWeights;
}
