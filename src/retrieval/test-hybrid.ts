import { memoryRepository } from "../memory/memory.repository.instance.js";
import { keywordIndex } from "./index/keyword.index.instance.js";

import { VectorRetriever } from "./vector/vector.retriever.js";
import { KeywordRetriever } from "./keyword/keyword.retriever.js";
import { HybridRetriever } from "./hybrid/hybrid.retriever.js";
import { KeywordIndexLoader } from "./index/keyword.index.loader.js";
import { GraphRetriever } from "./graph/graph.retriever.js";
import { MemoryRepository } from "../memory/memory.repository.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { GraphEvidenceRetriever } from "./graph/graph.evidence.retriever.js";
import { SemanticReranker } from "./reranking/semantic.reranker.js";
import { WeightedReciprocalRankFusion } from "./hybrid/weighted.rrf.js";

await new KeywordIndexLoader(memoryRepository, keywordIndex).load();

const repository = new MemoryRepository();
const vectorRetriever = new VectorRetriever(repository, new EmbeddingService());

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

const results = await hybridRetriever.search("Angular TypeScript");

console.table(
  results.map((r) => ({
    source: r.source,
    originalSources: r.originalSources?.join(", "),
    score: r.score.toFixed(3),
    text: r.memory.text,
  })),
);
