import { TrainingService } from "./training.service.js";
import type { JobScope } from "../../jobs-history/job.types.js";
import type { FeedbackScope } from "../feedback/feedback.types.js";

export function feedbackScopeFromJobScope(scope: JobScope): FeedbackScope {
  if (scope.kind !== "tenant") throw new Error("LTR training requires tenant job scope");
  return { kind: "tenant", tenantId: scope.tenantId };
}

export class TrainingJob {
  constructor(private readonly trainingService: TrainingService) {}

  async run(scope: JobScope): Promise<void> {
    console.log("[LTR] Training started");

    const start = Date.now();

    await this.trainingService.train(feedbackScopeFromJobScope(scope));

    console.log("[LTR] Training finished in", Date.now() - start, "ms");
  }
}
