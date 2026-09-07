import { LinearModel } from "../model/linear.model.js";
import { LTRService } from "./ltr.service.js";
import { FeatureExtractor } from "../features/feature.extractor.js";
import { DEFAULT_WEIGHTS } from "../model/default-weights.js";


const model = new LinearModel(DEFAULT_WEIGHTS);


const featureExtractor =
  new FeatureExtractor();


const service =
  new LTRService(
    model,
    featureExtractor
  );


const results = [
  {
    memory: {
      id: "memory-001",
      text: "Angular federation with TypeScript",
      importance: 0.9,
      confidence: 0.95,
      accessCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    semanticScore: 0.92,
    bm25Score: 0.81,
    graphScore: 0.7,
    diversity: 0.8,
    duplicatePenalty: 0,
  },

  {
    memory: {
      id: "memory-002",
      text: "Random backend information",
      importance: 0.3,
      confidence: 0.5,
      accessCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    semanticScore: 0.35,
    bm25Score: 0.22,
    graphScore: 0.1,
    diversity: 0.4,
    duplicatePenalty: 0.1,
  },
];


const ranked =
  service.rank(results);

if (ranked[0].memory.id !== "memory-001") {
  throw new Error("LTR ranking failed");
}

console.table(
  ranked.map(r => ({
    id: r.memory.id,
    score: r.ltrScore
  }))
);