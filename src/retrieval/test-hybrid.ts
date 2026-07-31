import { memoryRepository } from "../memory/memory.repository.instance.js";
import { keywordIndex } from "./index/keyword.index.instance.js";

import { VectorRetriever } from "./vector/vector.retriever.js";
import { KeywordRetriever } from "./keyword/keyword.retriever.js";
import { HybridRetriever } from "./hybrid/hybrid.retriever.js";
import { KeywordIndexLoader } from "./index/keyword.index.loader.js";

await new KeywordIndexLoader(
  memoryRepository,
  keywordIndex,
).load();

const hybrid = new HybridRetriever(
  new VectorRetriever(),
  new KeywordRetriever(
    keywordIndex,
    memoryRepository,
  ),
);

const results =
  await hybrid.search("Angular TypeScript");

console.table(
  results.map((r) => ({
    id: r.memory.id,
    text: r.memory.text,
    score: r.score,
    source: r.source,
  })),
);