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

import { FeatureExtractor } from "../ltr/features/feature.extractor.js";
import { LTRRanker } from "../ltr/ranking/ltr.ranker.js";

import { ModelRepository } from "../ltr/model/model.repository.js";
import { PersistentLTRModelProvider } from "../ltr/model/ltr.model.provider.js";

export function createRetrievalPipeline() {
  const repository = new MemoryRepository();

  const keywordIndex = new KeywordIndex();

  const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

  const vectorRetriever = new VectorRetriever(
    repository,
    new EmbeddingService(),
  );

  const graphRetriever = new GraphRetriever();

  const graphEvidenceRetriever = new GraphEvidenceRetriever();

  const fusion = new WeightedReciprocalRankFusion();

  const semanticReranker = new SemanticReranker();

  const hybridRetriever = new HybridRetriever(
    vectorRetriever,
    keywordRetriever,
    graphRetriever,
    graphEvidenceRetriever,
    fusion,
    semanticReranker,
  );

  /*
   * --------------------------------------------------------------------------
   * LTR
   * --------------------------------------------------------------------------
   *
   * LTRRanker ya no recibe un LinearModel directamente.
   * Usa un provider que carga el modelo actual desde ModelRepository.
   *
   * Esto permite que Online Learning actualice los pesos sin reiniciar
   * el servicio.
   *
   */

  const modelRepository = new ModelRepository();

  const modelProvider = new PersistentLTRModelProvider(modelRepository);

  const ltrRanker = new LTRRanker(new FeatureExtractor(), modelProvider);

  return new RetrievalPipeline(
    hybridRetriever,
    ltrRanker,
    new EmbeddingReranker(),
    new QualityScoringService(),
    new DuplicateDetector(new TextSimilarityService()),
    new DiversityService(new TextSimilarityService()),
  );
}
