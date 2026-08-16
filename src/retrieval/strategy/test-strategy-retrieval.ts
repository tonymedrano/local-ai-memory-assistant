import { QueryAnalyzer } from "../intelligence/query.analyzer.js";
import { RetrievalStrategySelector } from "./retrieval.strategy.selector.js";
import { HybridRetriever } from "../hybrid/hybrid.retriever.js";
import type { RetrievalResult } from "../retrieval.types.js";
import { EmbeddingService } from "../../embedding/embedding.service.js";
import { MemoryRepository } from "../../memory/memory.repository.js";
import { GraphEvidenceRetriever } from "../graph/graph.evidence.retriever.js";
import { GraphRetriever } from "../graph/graph.retriever.js";
import { WeightedReciprocalRankFusion } from "../hybrid/weighted.rrf.js";
import { KeywordIndex } from "../index/keyword.index.js";
import { KeywordRetriever } from "../keyword/keyword.retriever.js";
import { SemanticReranker } from "../reranking/semantic.reranker.js";
import { VectorRetriever } from "../vector/vector.retriever.js";
import { KeywordIndexLoader } from "../index/keyword.index.loader.js";

const analyzer = new QueryAnalyzer();
const selector = new RetrievalStrategySelector();

const repository = new MemoryRepository();

const keywordIndex = new KeywordIndex();

const keywordIndexLoader = new KeywordIndexLoader(repository, keywordIndex);

await keywordIndexLoader.load();

const vectorRetriever = new VectorRetriever(repository, new EmbeddingService());

const keywordRetriever = new KeywordRetriever(keywordIndex, repository);

const graphRetriever = new GraphRetriever();

const fusion = new WeightedReciprocalRankFusion();
const semanticReranker = new SemanticReranker();
const graphEvidenceRetriever = new GraphEvidenceRetriever();

// Usa aquí la misma construcción de HybridRetriever
// que ya utilizas en test-pipeline.ts.
const hybridRetriever = new HybridRetriever(
  vectorRetriever,
  keywordRetriever,
  graphRetriever,
  graphEvidenceRetriever,
  fusion,
  semanticReranker,
);

const queries = [
  "angular signals",
  "what is Angular Signals?",
  "¿qué relación existe entre Angular y TypeScript?",
  '"angular signals"',
  "retrieval",
];

for (const query of queries) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`QUERY: ${query}`);
  console.log("=".repeat(70));

  const profile = analyzer.analyze(query);
  const strategy = selector.select(profile);

  console.dir(
    {
      profile,
      strategy,
    },
    { depth: null },
  );

  const results = await hybridRetriever.search({
    query,
    strategy,
  });

  console.table(
    results.slice(0, 5).map((result: RetrievalResult, index: number) => ({
      rank: index + 1,
      id: result.memory.id,
      score: result.score,
      sources: result.originalSources?.join(", "),
    })),
  );
}

console.log("\n✓ Strategy retrieval test completed");
