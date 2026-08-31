import { DashboardService } from "../dashboard/dashboard.service.js";

import { LearningRepository } from "../learning/learning.repository.js";
import { LearningService } from "../learning/learning.service.js";

import { MemoryRepository } from "../memory/memory.repository.js";

import { InMemoryMetricsRepository } from "../metrics/metrics.repository.js";
import { MetricsService } from "../metrics/metrics.service.js";

import { EmbeddingService } from "../embedding/embedding.service.js";

import { HybridRetriever } from "../retrieval/hybrid/hybrid.retriever.js";
import { WeightedReciprocalRankFusion } from "../retrieval/hybrid/weighted.rrf.js";

import { KeywordIndex } from "../retrieval/index/keyword.index.js";
import { KeywordIndexLoader } from "../retrieval/index/keyword.index.loader.js";

import { KeywordRetriever } from "../retrieval/keyword/keyword.retriever.js";

import { RetrievalPipeline } from "../retrieval/pipeline/retrieval.pipeline.js";

import { DiversityService } from "../retrieval/quality/diversity.service.js";
import { DuplicateDetector } from "../retrieval/quality/duplicate/duplicate.detector.js";
import { QualityScoringService } from "../retrieval/quality/quality.service.js";
import { TextSimilarityService } from "../retrieval/quality/text-similarity.service.js";

import { EmbeddingReranker } from "../retrieval/reranker/embedding.reranker.js";
import { SemanticReranker } from "../retrieval/reranking/semantic.reranker.js";

import { VectorRetriever } from "../retrieval/vector/vector.retriever.js";

import { GraphRetriever } from "../retrieval/graph/graph.retriever.js";
import { GraphEvidenceRetriever } from "../retrieval/graph/graph.evidence.retriever.js";

import { FeatureExtractor } from "../ltr/features/feature.extractor.js";

import { LinearModel } from "../ltr/model/linear.model.js";
import { DEFAULT_WEIGHTS } from "../ltr/model/default-weights.js";
import { ModelRepository } from "../ltr/model/model.repository.js";

import { LearningRanker } from "../ltr/ranking/learning.ranker.js";
import { LTRRanker } from "../ltr/ranking/ltr.ranker.js";

import { FeedbackRepository } from "../ltr/feedback/feedback.repository.js";
import { FeedbackService } from "../ltr/feedback/feedback.service.js";
import { FeedbackCollector } from "../ltr/feedback/feedback.collector.js";
import { FeedbackLearningService } from "../ltr/feedback/feedback.learning.service.js";
import { FeedbackDrivenReranker } from "../ltr/feedback/feedback-driven.reranker.js";

import { TrainingService } from "../ltr/training/training.service.js";

import { LearningRate } from "../ltr/online/online.learning-rate.js";
import { OnlineOptimizer } from "../ltr/online/online.optimizer.js";
import { OnlineTrainer } from "../ltr/online/online.trainer.js";
import { OnlineTrainingService } from "../ltr/online/online.training.service.js";

import { PersistentLTRModelProvider } from "../ltr/model/ltr.model.provider.js";

import { createMemoryService } from "../memory/memory.service.js";

import { ConsolidationService } from "../memory/consolidation/consolidation.service.js";

import { ContextAwareScoringService } from "../retrieval/context/context-aware-scoring.service.js";

/* -------------------------------------------------------------------------- */
/*                              Metrics / Learning                            */
/* -------------------------------------------------------------------------- */

export const metricsRepository = new InMemoryMetricsRepository();

export const metricsService = new MetricsService(metricsRepository);

export const dashboardService = new DashboardService(metricsService);

export const learningRepository = new LearningRepository();

export const learningService = new LearningService(learningRepository);

/* -------------------------------------------------------------------------- */
/*                                Memory                                      */
/* -------------------------------------------------------------------------- */

export const memoryRepository = new MemoryRepository();

/* -------------------------------------------------------------------------- */
/*                              Retrieval Index                                */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT:
 *
 * Do NOT import keywordIndex / keywordIndexLoader from
 * keyword.index.instance.ts / keyword.index.loader.instance.ts.
 *
 * They depend on memoryRepository and create an ESM circular dependency.
 *
 * Everything is instantiated here, in dependency order.
 */
export const keywordIndex = new KeywordIndex();

export const keywordIndexLoader = new KeywordIndexLoader(
  memoryRepository,
  keywordIndex,
);

/* -------------------------------------------------------------------------- */
/*                              Retrieval Core                                 */
/* -------------------------------------------------------------------------- */

const embeddingService = new EmbeddingService();

const vectorRetriever = new VectorRetriever(memoryRepository, embeddingService);

const keywordRetriever = new KeywordRetriever(keywordIndex, memoryRepository);

const graphRetriever = new GraphRetriever();

const graphEvidenceRetriever = new GraphEvidenceRetriever();

const fusion = new WeightedReciprocalRankFusion();

const semanticReranker = new SemanticReranker();

export const hybridRetriever = new HybridRetriever(
  vectorRetriever,
  keywordRetriever,
  graphRetriever,
  graphEvidenceRetriever,
  fusion,
  semanticReranker,
);

/* -------------------------------------------------------------------------- */
/*                                    LTR                                     */
/* -------------------------------------------------------------------------- */

export const feedbackRepository = new FeedbackRepository();

export const modelRepository = new ModelRepository();

export const ltrModelProvider = new PersistentLTRModelProvider(modelRepository);

/* -------------------------------------------------------------------------- */
/*                              LTR Components                                */
/* -------------------------------------------------------------------------- */
export const contextAwareScoring = new ContextAwareScoringService();

export const ltrRanker =
  new LTRRanker(
    new FeatureExtractor(),
    ltrModelProvider,
    contextAwareScoring,
  );

/**
 * LearningRanker todavía trabaja con un modelo directo.
 *
 * Lo mantenemos separado del LTRRanker hasta que terminemos
 * la unificación del sistema de ranking.
 */
const storedModel = modelRepository.load();

const model = new LinearModel(storedModel?.weights ?? DEFAULT_WEIGHTS);

export const learningRanker = new LearningRanker(new FeatureExtractor(), model);

/* -------------------------------------------------------------------------- */
/*                           Online Training                                  */
/* -------------------------------------------------------------------------- */

const learningRate = new LearningRate();

const onlineOptimizer = new OnlineOptimizer(learningRate);

const onlineTrainer = new OnlineTrainer(modelRepository, onlineOptimizer);

export const onlineTrainingService = new OnlineTrainingService(onlineTrainer);

/* -------------------------------------------------------------------------- */
/*                                  Feedback                                  */
/* -------------------------------------------------------------------------- */

export const feedbackService = new FeedbackService(feedbackRepository);

export const feedbackLearningService = new FeedbackLearningService(
  feedbackService,
  onlineTrainingService,
);

export const feedbackCollector = new FeedbackCollector(
  feedbackLearningService,
  new FeatureExtractor(),
);

export const feedbackDrivenReranker = new FeedbackDrivenReranker(
  feedbackRepository,
);

/* -------------------------------------------------------------------------- */
/*                              Offline Training                              */
/* -------------------------------------------------------------------------- */

export const trainingService = new TrainingService(
  feedbackRepository,
  modelRepository,
);

/* -------------------------------------------------------------------------- */
/*                           Retrieval Pipeline                               */
/* -------------------------------------------------------------------------- */

export const retrievalPipeline = new RetrievalPipeline(
  hybridRetriever,
  ltrRanker,
  new EmbeddingReranker(),
  new QualityScoringService(),
  new DuplicateDetector(new TextSimilarityService()),
  new DiversityService(new TextSimilarityService()),
  metricsService,
  feedbackCollector,
  feedbackDrivenReranker,
);

/* -------------------------------------------------------------------------- */
/*                           Learning Lifecycle                               */
/* -------------------------------------------------------------------------- */

export async function initLearning() {
  await learningRepository.init();

  console.log(`[Learning] Loaded ${learningRepository.getAll().length} events`);
}

/* -------------------------------------------------------------------------- */
/*                              Memory Service                                */
/* -------------------------------------------------------------------------- */

const memoryService = createMemoryService(memoryRepository, keywordIndex);

export const store = memoryService.store;

export const recall = memoryService.recall;

/* -------------------------------------------------------------------------- */
/*                              Consolidation Service                                */
/* -------------------------------------------------------------------------- */
export const consolidationService = new ConsolidationService(memoryRepository);
