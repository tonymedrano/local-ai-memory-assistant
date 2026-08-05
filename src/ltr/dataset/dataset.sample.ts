import type { FeatureVector } from "../features/feature.types.js";

export interface DatasetSample {
    query: string;
    memoryId: string;
    features: FeatureVector;
    label: number;
    createdAt: Date;
}