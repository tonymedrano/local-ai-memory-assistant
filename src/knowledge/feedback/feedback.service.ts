import { feedbackStorage } from "./feedback.storage.js";

import type { KnowledgeFeedback } from "./feedback.types.js";

export function applyFeedback(
  knowledgeId: string,
  currentConfidence: number,
  action: "boost" | "weaken" | "mark-uncertain",
  reason: string,
): KnowledgeFeedback {
  let newConfidence = currentConfidence;

  switch (action) {
    case "boost":
      newConfidence = Math.min(1, currentConfidence + 0.1);

      break;

    case "weaken":
      newConfidence = Math.max(0, currentConfidence - 0.2);

      break;

    case "mark-uncertain":
      newConfidence = 0.5;

      break;
  }

  const feedback: KnowledgeFeedback = {
    knowledgeId,

    action,

    previousConfidence: currentConfidence,

    newConfidence,

    reason,

    createdAt: new Date().toISOString(),
  };

  feedbackStorage.add(feedback);

  return feedback;
}
