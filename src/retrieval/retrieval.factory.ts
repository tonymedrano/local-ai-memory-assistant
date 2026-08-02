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

export function createRetrievalPipeline() {
  const repository = new MemoryRepository();

  const keywordIndex = new KeywordIndex();

  const vectorRetriever = new VectorRetriever(
    repository,
    new EmbeddingService(),
  );

  const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

  const hybridRetriever = new HybridRetriever(
    vectorRetriever,
    keywordRetriever,
  );

  return new RetrievalPipeline(
    hybridRetriever,
    new EmbeddingReranker(),
    new QualityScoringService(),
    new DuplicateDetector(new TextSimilarityService()),
    new DiversityService(new TextSimilarityService()),
  );
}
