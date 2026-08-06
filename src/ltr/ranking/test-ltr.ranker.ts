import { LTRRanker } from "./ltr.ranker.js";
import { FeatureExtractor } from "../features/feature.extractor.js";

import type { LTRModel } from "../training/ltr.model.js";
import type { FeatureVector } from "../features/feature.types.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { LTRModelProvider } from "../model/ltr.model.provider.interface.js";

const mockModel: LTRModel = {
  predict(features: FeatureVector): number {
    return (
      features.semantic * 0.5 +
      features.bm25 * 0.38 +
      features.importance * 0.12
    );
  },

  getWeights() {
    return {
      semantic: 0.5,
      bm25: 0.38,
      importance: 0.12,
    };
  },
};

const mockModelProvider: LTRModelProvider = {
  getModel() {
    return mockModel;
  },
};


const ranker = new LTRRanker(
  new FeatureExtractor(),
  mockModelProvider,
);

const results: RetrievalResult[] = [
  {
    memory: {
      id: "memory-001",
      text: "Angular Federation with TypeScript",
      importance: 0.9,
      confidence: 0.9,
      accessCount: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    score: 0.8,
    source: "hybrid",

    semanticScore: 0.92,
    keywordScore: 0.81,
    graphScore: 0.5,
    diversityScore: 0.8,
  },

  {
    memory: {
      id: "memory-002",
      text: "Random backend information",
      importance: 0.3,
      confidence: 0.5,
      accessCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    score: 0.4,
    source: "hybrid",

    semanticScore: 0.35,
    keywordScore: 0.22,
    graphScore: 0.1,
    diversityScore: 0.5,
  },
];

const ranked = ranker.rank("angular federation", results);

console.table(
  ranked.map((item) => ({
    id: item.result.memory.id,
    score: item.score,
  })),
);
