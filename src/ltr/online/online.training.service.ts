import type { FeatureVector } from "../features/feature.types.js";
import type { StoredModel } from "../model/model.types.js";
import { OnlineTrainer } from "./online.trainer.js";

export class OnlineTrainingService {
  constructor(private readonly trainer: OnlineTrainer) {}

  /**
   * Aprende a partir de una interacción del usuario.
   *
   * label:
   * 1 = ACCEPT
   * 0 = REJECT
   */
  async learn(features: FeatureVector, label: number): Promise<StoredModel> {
    return this.trainer.train(features, label);
  }
}
