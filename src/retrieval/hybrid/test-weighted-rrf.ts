import { WeightedReciprocalRankFusion } from "./weighted.rrf.js";
import type { RetrievalResult } from "../../retrieval/retrieval.types.js";
import type { RetrievalStrategy } from "../strategy/retrieval.strategy.js";

const fusion = new WeightedReciprocalRankFusion();

function result(
  id: string,
  source: RetrievalResult["source"],
): RetrievalResult {
  return {
    memory: {
      id,
      text: `Memory ${id}`,
    },
    score: 0,
    source,
  };
}

const vectorResults: RetrievalResult[] = [
  result("A", "vector"),
  result("B", "vector"),
  result("C", "vector"),
];

const keywordResults: RetrievalResult[] = [
  result("B", "keyword"),
  result("C", "keyword"),
  result("D", "keyword"),
];

const graphResults: RetrievalResult[] = [
  result("C", "graph"),
  result("D", "graph"),
  result("E", "graph"),
];

const evidenceResults: RetrievalResult[] = [
  result("D", "graph-evidence"),
  result("E", "graph-evidence"),
  result("F", "graph-evidence"),
];

const strategies: Array<{
  name: string;
  strategy: RetrievalStrategy;
}> = [
  {
    name: "VECTOR HEAVY",
    strategy: {
      mode: "hybrid",
      vectorWeight: 1,
      keywordWeight: 0.1,
      graphWeight: 0,
      graphEvidenceWeight: 0,
      topK: 10,
      expandQuery: false,
      rerank: true,
      temporalBoost: 0,
    },
  },
  {
    name: "KEYWORD HEAVY",
    strategy: {
      mode: "hybrid",
      vectorWeight: 0.1,
      keywordWeight: 1,
      graphWeight: 0,
      graphEvidenceWeight: 0,
      topK: 10,
      expandQuery: false,
      rerank: true,
      temporalBoost: 0,
    },
  },
  {
    name: "GRAPH HEAVY",
    strategy: {
      mode: "hybrid",
      vectorWeight: 0.1,
      keywordWeight: 0.1,
      graphWeight: 1,
      graphEvidenceWeight: 1,
      topK: 10,
      expandQuery: false,
      rerank: true,
      temporalBoost: 0,
    },
  },
];

for (const { name, strategy } of strategies) {
  console.log(`\n=== ${name} ===`);

  const results = fusion.fuse(
  vectorResults,
  keywordResults,
  graphResults,
  evidenceResults,
  {
    vector: strategy?.vectorWeight ?? 0.6,
    keyword: strategy?.keywordWeight ?? 0.4,
    graph: strategy?.graphWeight ?? 0,
    graphEvidence: strategy?.graphEvidenceWeight ?? 0,
  },
);

  console.table(
    results.map((item, index) => ({
      rank: index + 1,
      id: item.memory.id,
      score: item.score,
      sources: item.originalSources?.join(", "),
    })),
  );
}

console.log("\n✓ Weighted RRF test completed");