import { ModelRepository } from "./model.repository.js";
import { LinearModel } from "./linear.model.js";

export class ModelProvider {
  constructor(private repository: ModelRepository) {}

  getModel(): LinearModel {
    const stored = this.repository.load();

    return new LinearModel(stored!.weights);
  }
}
