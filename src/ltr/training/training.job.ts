import { TrainingService } from "./training.service.js";

export class TrainingJob {
  constructor(private readonly trainingService: TrainingService) {}

  async run(): Promise<void> {
    console.log("[LTR] Training started");

    const start = Date.now();

    await this.trainingService.train();

    console.log("[LTR] Training finished in", Date.now() - start, "ms");
  }
}
