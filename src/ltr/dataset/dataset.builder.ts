import type { TrainingExample } from "./dataset.types.js";
import type { FeatureStorage } from "../storage/feature.storage.js";

export class DatasetBuilder {
  constructor(private readonly storage: FeatureStorage) {}

  build(labels: Map<string, number>): TrainingExample[] {
    return this.storage
      .getAll()

      .filter((item) => labels.has(item.memoryId))

      .map((item) => ({
        query: item.query,
        memoryId: item.memoryId,
        features: item.features as Record<string, number>,
        label: labels.get(item.memoryId)!,
      }));
  }
}
