import { LinearModel } from "./model/linear.model.js";

const model = new LinearModel({
  semantic: 0.4,
  bm25: 0.2,
  importance: 0.1,
  confidence: 0.1,
  freshness: 0.05,
  graphEvidence: 0.1,
  accessCount: 0.02,
  diversity: 0.03,
  duplicatePenalty: -0.2,
});

const memories = [
  {
    id: "A",
    features: {
      semantic: 0.95,
      bm25: 0.4,
      importance: 0.9,
      confidence: 0.9,
      freshness: 0.9,
      graphEvidence: 0.5,
      accessCount: 0.4,
      diversity: 0.8,
      duplicatePenalty: 0,
    },
  },

  {
    id: "B",
    features: {
      semantic: 0.45,
      bm25: 0.9,
      importance: 0.2,
      confidence: 0.8,
      freshness: 0.3,
      graphEvidence: 0.1,
      accessCount: 0.1,
      diversity: 0.2,
      duplicatePenalty: 0,
    },
  },
];

const ranked = memories
  .map((m) => ({
    ...m,
    score: model.predict(m.features),
  }))
  .sort((a, b) => b.score - a.score);

console.table(ranked);