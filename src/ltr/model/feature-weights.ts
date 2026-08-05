import type { FeatureVector } from "../features/feature.types.js";

export type FeatureWeights = Record<keyof FeatureVector, number>;