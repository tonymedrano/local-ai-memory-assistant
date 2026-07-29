import { AdaptiveWeightsService } from "./adaptive.weights.js";
import { calculateRelevanceScore } from "./relevance.score.js";

const service = new AdaptiveWeightsService();

console.log("Decision", service.getWeights("decision"));

console.log("Architecture", service.getWeights("architecture"));

console.log("Code", service.getWeights("code"));

console.log(
  calculateRelevanceScore({
    confidence: 0.8,
    importance: 0.7,
    accessCount: 5,
    intent: "decision",
    feedbackScore: 1,
  }),
);
