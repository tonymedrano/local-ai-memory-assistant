import { inferenceRepository } from "../../knowledge/inference/inference.repository.js";

export class InferenceProvider {
  search() {
    return inferenceRepository.getAll();
  }
}