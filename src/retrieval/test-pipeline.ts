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

async function main() {
  const repository = new MemoryRepository();

  const keywordIndex = new KeywordIndex();

  const vectorRetriever = new VectorRetriever(
    repository,
    new EmbeddingService(),
  );

  const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

  const graphRetriever = new GraphRetriever();

  const graphEvidenceRetriever = new GraphEvidenceRetriever();
    
    const hybridRetriever = new HybridRetriever(
      vectorRetriever,
      keywordRetriever,
      graphRetriever,
      graphEvidenceRetriever,
    );

  const reranker = new EmbeddingReranker();

  const pipeline = new RetrievalPipeline(
    hybridRetriever,
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
