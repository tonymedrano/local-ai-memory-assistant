import { RetrievalPipeline } from "./pipeline/retrieval.pipeline.js";

import { HybridRetriever } from "./hybrid/hybrid.retriever.js";
import { VectorRetriever } from "./vector/vector.retriever.js";
import { KeywordRetriever } from "./keyword/keyword.retriever.js";

import { EmbeddingReranker } from "./reranker/embedding.reranker.js";

import { QualityScoringService } from "./quality/quality.service.js";
import { DuplicateDetector } from "./quality/duplicate/duplicate.detector.js";
import { DiversityService } from "./quality/diversity.service.js";
import { TextSimilarityService } from "./quality/text-similarity.service.js";

import { KeywordIndex } from "./index/keyword.index.js";
import { MemoryRepository } from "../memory/memory.repository.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { GraphRetriever } from "./graph/graph.retriever.js";
import { GraphEvidenceRetriever } from "./graph/graph.evidence.retriever.js";
import { WeightedReciprocalRankFusion } from "./hybrid/weighted.rrf.js";
import { SemanticReranker } from "./reranking/semantic.reranker.js";

import { LTRRanker } from "../ltr/ranking/ltr.ranker.js";
import { FeatureExtractor } from "../ltr/features/feature.extractor.js";
import { LinearModel } from "../ltr/model/linear.model.js";

export function createRetrievalPipeline() {
  const repository = new MemoryRepository();

  const keywordIndex = new KeywordIndex();

  const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

  const vectorRetriever = new VectorRetriever(
    repository,
    new EmbeddingService(),
  );

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

  const ltrRanker = new LTRRanker(
    new FeatureExtractor(),

    new LinearModel({
      semantic: 0.35,
      bm25: 0.2,
      importance: 0.15,
      confidence: 0.1,
      freshness: 0.1,
      graphEvidence: 0.05,
      accessCount: 0.03,
      diversity: 0.02,
      duplicatePenalty: -0.1,
    }),
  );

  return new RetrievalPipeline(
    hybridRetriever,
    ltrRanker,
    new EmbeddingReranker(),
    new QualityScoringService(),
    new DuplicateDetector(new TextSimilarityService()),
    new DiversityService(new TextSimilarityService()),
  );
}
