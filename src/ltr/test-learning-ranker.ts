import type { RetrievalResult } from "../retrieval/retrieval.types.js";
import { FeatureExtractor } from "./features/feature.extractor.js";
import { DEFAULT_WEIGHTS } from "./model/default-weights.js";
import { LinearModel } from "./model/linear.model.js";
import { LearningRanker } from "./ranking/learning.ranker.js";

const extractor = new FeatureExtractor();

const model = new LinearModel(DEFAULT_WEIGHTS);

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
