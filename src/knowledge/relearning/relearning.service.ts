import type { RelearningResult } from "./relearning.types.js";

export class RelearningService {
  evaluate(knowledgeId: string, confidence: number): RelearningResult {
    let decision: "boost" | "weaken" | "mark-uncertain";

    let reason: string;

    if (confidence >= 0.9) {
      decision = "boost";

      reason = "High confidence knowledge";
    } else if (confidence <= 0.3) {
      decision = "weaken";

      reason = "Low confidence knowledge";
    } else {
      decision = "mark-uncertain";

      reason = "Confidence requires review";
    }

    return {
      knowledgeId,

      decision,

      reason,

      createdAt: new Date(),
    };
  }
}
