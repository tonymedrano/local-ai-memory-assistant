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
  
  const hybridRetriever = new HybridRetriever(
    vectorRetriever,
    keywordRetriever,
    graphRetriever,
    graphEvidenceRetriever,
  );

  return new RetrievalPipeline(
    hybridRetriever,
    new EmbeddingReranker(),
    new QualityScoringService(),
    new DuplicateDetector(new TextSimilarityService()),
    new DiversityService(new TextSimilarityService()),
  );
}
