import type { FeatureVector } from "../features/feature.types.js";
import { ModelRepository } from "../model/model.repository.js";
import type { StoredModel } from "../model/model.types.js";
import { OnlineOptimizer } from "./online.optimizer.js";

export class OnlineTrainer {
  constructor(
    private readonly repository: ModelRepository,
    private readonly optimizer: OnlineOptimizer,
  ) {}

  async train(features: FeatureVector, label: number): Promise<StoredModel> {
    const model = await this.repository.load();

    if (!model) {
      throw new Error(
        "No trained model found. Train a model before using online training.",
      );
    }

    const updated = this.optimizer.update(
      model,
      features,
      label,
      model.samples + 1,
    );

    const stored: StoredModel = {
      ...updated,
      samples: model.samples + 1,
    };

    await this.repository.save(stored);

    return stored;
  }
}
