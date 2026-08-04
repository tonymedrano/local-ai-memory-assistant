import type { RetrievalResult } from "../retrieval/retrieval.types.js";
import { FeatureExtractor } from "./features/feature.extractor.js";
import { LinearModel } from "./model/linear.model.js";
import { LearningRanker } from "./ranking/learning.ranker.js";

const extractor = new FeatureExtractor();

const model = new LinearModel({
  semantic: 0.35,
  bm25: 0.2,
  importance: 0.15,
  confidence: 0.1,
  freshness: 0.1,
  graphEvidence: 0.05,
  accessCount: 0.03,
  diversity: 0.02,
  duplicatePenalty: -0.1,
});

const ranker = new LearningRanker(extractor, model);

const results: RetrievalResult[] = [
  {
    memory: {
      id: "A",
      text: "Angular uses TypeScript",
      importance: 0.9,
      confidence: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    score: 0.8,
    semanticScore: 0.95,
    keywordScore: 0.8,
    graphScore: 0.7,
    diversityScore: 0.9,
    duplicatePenalty: 0,
    source: "hybrid",
  },
  {
    memory: {
      id: "B",
      text: "Random note",
      importance: 0.2,
      confidence: 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    score: 0.4,
    semanticScore: 0.3,
    keywordScore: 0.2,
    graphScore: 0,
    diversityScore: 0.5,
    duplicatePenalty: 0,
    source: "hybrid",
  },
];

const ranked = ranker.rank(results);

console.table(
  ranked.map((r) => ({
    id: r.memory.id,
    score: r.score,
    text: r.memory.text,
  })),
);
