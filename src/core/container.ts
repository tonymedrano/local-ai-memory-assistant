import { DashboardService } from "../dashboard/dashboard.service.js";
import { LearningRepository } from "../learning/learning.repository.js";
import { LearningService } from "../learning/learning.service.js";

import { MemoryRepository } from "../memory/memory.repository.js";
import { InMemoryMetricsRepository } from "../metrics/metrics.repository.js";
import { MetricsService } from "../metrics/metrics.service.js";
import { HybridRetriever } from "../retrieval/hybrid/hybrid.retriever.js";

import { KeywordIndex } from "../retrieval/index/keyword.index.js";
import { KeywordIndexLoader } from "../retrieval/index/keyword.index.loader.js";
import { KeywordRetriever } from "../retrieval/keyword/keyword.retriever.js";
import { RetrievalPipeline } from "../retrieval/pipeline/retrieval.pipeline.js";
import { DiversityService } from "../retrieval/quality/diversity.service.js";
import { DuplicateDetector } from "../retrieval/quality/duplicate/duplicate.detector.js";
import { QualityScoringService } from "../retrieval/quality/quality.service.js";
import { TextSimilarityService } from "../retrieval/quality/text-similarity.service.js";
import { EmbeddingReranker } from "../retrieval/reranker/embedding.reranker.js";
import { VectorRetriever } from "../retrieval/vector/vector.retriever.js";


import { EmbeddingService } from "../embedding/embedding.service.js";
import { GraphRetriever } from "../retrieval/graph/graph.retriever.js";

export const metricsRepository = new InMemoryMetricsRepository();
export const metricsService = new MetricsService(metricsRepository);
export const dashboardService = new DashboardService(metricsService);

export const learningRepository = new LearningRepository();
export const learningService = new LearningService(learningRepository);
export const memoryRepository = new MemoryRepository();
export const keywordIndex = new KeywordIndex();
export const keywordIndexLoader = new KeywordIndexLoader(
  memoryRepository,
  keywordIndex,
);



const repository = new MemoryRepository();
const embeddingService = new EmbeddingService();

const vectorRetriever = new VectorRetriever(
  repository,
  embeddingService,
);

const graphRetriever = new GraphRetriever();

const keywordRetriever = new KeywordRetriever(keywordIndex, memoryRepository);

const hybridRetriever = new HybridRetriever(
  vectorRetriever,
  keywordRetriever,
  graphRetriever,
);

export const retrievalPipeline = new RetrievalPipeline(
  hybridRetriever,
  new EmbeddingReranker(),
  new QualityScoringService(),
  new DuplicateDetector(new TextSimilarityService()),
  new DiversityService(new TextSimilarityService()),
  metricsService,
);

export async function initLearning() {
  await learningRepository.init();

  console.log(`[Learning] Loaded ${learningRepository.getAll().length} events`);
}
