import { ContextAwareScoringService } from "../../retrieval/context/context-aware-scoring.service.js";

import { FeatureExtractor } from "../features/feature.extractor.js";
import { LinearModel } from "../model/linear.model.js";
import { DEFAULT_WEIGHTS } from "../model/default-weights.js";

import { LTRRanker } from "./ltr.ranker.js";

import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { ContextModel } from "../../context/model/context.model.js";
import type { LTRModelProvider } from "../model/ltr.model.provider.interface.js";

import { MemoryType } from "../../memory/memory.types.js";


const contextScoring = new ContextAwareScoringService();

const featureExtractor = new FeatureExtractor();

const model = new LinearModel(DEFAULT_WEIGHTS);

const modelProvider: LTRModelProvider = {
  getModel() {
    return model;
  },
};

const ranker = new LTRRanker(
  featureExtractor,
  modelProvider,
  contextScoring,
);


const now = new Date().toISOString();

const results: RetrievalResult[] = [
  {
    memory: {
      id: "memory-angular",
      text: "Angular project decision",
      project: "memory-service",
      type: MemoryType.DECISION,
      importance: 0.8,
      confidence: 0.9,
      createdAt: now,
      updatedAt: now,
      tags: ["angular"],
    },

    score: 0.8,
    source: "hybrid",
    semanticScore: 0.8,
    keywordScore: 0.8,
    graphScore: 0,
    diversityScore: 0,
  },

  {
    memory: {
      id: "memory-react",
      text: "React project decision",
      project: "other-project",
      type: MemoryType.DECISION,
      importance: 0.8,
      confidence: 0.9,
      createdAt: now,
      updatedAt: now,
      tags: ["react"],
    },

    score: 0.8,
    source: "hybrid",
    semanticScore: 0.8,
    keywordScore: 0.8,
    graphScore: 0,
    diversityScore: 0,
  },
];

const context: ContextModel = {
  id: "context-001",
  query: "Angular project",
  entities: [],
  topics: ["angular"],
  goals: [],
  temporal: undefined,
  project: "memory-service",
  constraints: [],
  memories: [
    {
      id: "memory-angular",
      relevance: 1,
    },
  ],
  knowledge: [],
  confidence: 1,
  createdAt: now,
};

console.log("\n=== CONTEXT SCORES ===");

for (const result of results) {
  const score = contextScoring.score({
    memory: result.memory,
    context,
  });

  console.log(result.memory.id, score);
}

console.log("\n=== LTR RANKING ===");

const ranked = ranker.rank(
  "Angular project",
  results,
  context,
);

console.table(
  ranked.map((item) => ({
    id: item.result.memory.id,
    score: item.score,
  })),
);

if (ranked[0]?.result.memory.id !== "memory-angular") {
  throw new Error(
    "Context-aware ranking failed: Angular memory should rank first",
  );
}

console.log(
  "\n✓ context-aware ranking prioritizes the context-relevant memory",
);