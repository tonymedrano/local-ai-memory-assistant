// src/retrieval/test-pipeline.ts

import { MemoryRepository } from "../memory/memory.repository.js";

import { KeywordIndex } from "./index/keyword.index.js";

import { VectorRetriever } from "./vector/vector.retriever.js";
import { KeywordRetriever } from "./keyword/keyword.retriever.js";

import { HybridRetriever } from "./hybrid/hybrid.retriever.js";

import { EmbeddingReranker } from "./reranker/embedding.reranker.js";
import { RetrievalPipeline } from "./pipeline/retrieval.pipeline.js";
import { DiversityService } from "./quality/diversity.service.js";
import { QualityScoringService } from "./quality/quality.service.js";
import { TextSimilarityService } from "./quality/text-similarity.service.js";
import { DuplicateDetector } from "./quality/duplicate/duplicate.detector.js";
import { GraphRetriever } from "./graph/graph.retriever.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { GraphEvidenceRetriever } from "./graph/graph.evidence.retriever.js";
import { WeightedReciprocalRankFusion } from "./hybrid/weighted.rrf.js";
import { SemanticReranker } from "./reranking/semantic.reranker.js";

import { FeatureExtractor } from "../ltr/features/feature.extractor.js";
import { LinearModel } from "../ltr/model/linear.model.js";

import type { LTRModel } from "../ltr/training/ltr.model.js";
import type { FeatureVector } from "../ltr/features/feature.types.js";
import type { LTRModelProvider } from "../ltr/model/ltr.model.provider.interface.js";
import { LTRRanker } from "../ltr/ranking/ltr.ranker.js";

async function main() {
  const repository = new MemoryRepository();

  const keywordIndex = new KeywordIndex();

  const vectorRetriever = new VectorRetriever(
    repository,
    new EmbeddingService(),
  );

  const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

  const graphRetriever = new GraphRetriever();

  const fusion = new WeightedReciprocalRankFusion();
  const semanticReranker = new SemanticReranker();
  const graphEvidenceRetriever = new GraphEvidenceRetriever();

  const hybridRetriever = new HybridRetriever(
    vectorRetriever,
    keywordRetriever,
    graphRetriever,
    graphEvidenceRetriever,
    fusion,
    semanticReranker,
  );

  const reranker = new EmbeddingReranker();
  const mockModel: LTRModel = {
    predict(features: FeatureVector): number {
      return (
        features.semantic * 0.35 +
        features.bm25 * 0.2 +
        features.importance * 0.15 +
        features.confidence * 0.1 +
        features.freshness * 0.1 +
        features.graphEvidence * 0.05 +
        features.accessCount * 0.03 +
        features.diversity * 0.02 +
        features.duplicatePenalty * -0.1
      );
    },

    getWeights() {
      return {
        semantic: 0.35,
        bm25: 0.2,
        importance: 0.15,
        confidence: 0.1,
        freshness: 0.1,
        graphEvidence: 0.05,
        accessCount: 0.03,
        diversity: 0.02,
        duplicatePenalty: -0.1,

        feedbackScore: 0,
        retrievalFrequency: 0,
        ageScore: 0,
      };
    },
  };

  const mockModelProvider: LTRModelProvider = {
    getModel() {
      return mockModel;
    },
  };

  const ltrRanker = new LTRRanker(new FeatureExtractor(), mockModelProvider);

  const pipeline = new RetrievalPipeline(
    hybridRetriever,
    ltrRanker,
    reranker,
    new QualityScoringService(),
    new DuplicateDetector(new TextSimilarityService()),
    new DiversityService(new TextSimilarityService()),
  );

  const result = await pipeline.retrieve({
    query: "Angular Native Federation",
    limit: 5,
  });

  if (!result.memories.length) {
    throw new Error("No retrieval results");
  }

  console.log(
    "Pipeline OK:",
    result.memories.length,
    "results in",
    result.elapsedMs,
    "ms",
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
