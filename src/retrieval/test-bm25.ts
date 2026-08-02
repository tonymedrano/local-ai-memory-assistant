import { BM25Ranker } from "./bm25/bm25.ranker.js";
import { KeywordIndex } from "./index/keyword.index.js";
import { MemoryType, type Memory } from "../memory/memory.types.js";

const index = new KeywordIndex();

const memories: Memory[] = [
  {
    id: "1",
    text: "Angular uses TypeScript for frontend development",
    type: MemoryType.FACT,
  },
  {
    id: "2",
    text: "Angular Signals improve frontend state management",
    type: MemoryType.FACT,
  },
  {
    id: "3",
    text: "Python Django backend framework",
    type: MemoryType.FACT,
  },
];

for (const memory of memories) {
  index.add(memory);
}

const ranker = new BM25Ranker(index);

const query = "Angular TypeScript";

console.log(`Query: "${query}"\n`);

const results = memories
  .map((memory) => ({
    id: memory.id,
    text: memory.text,
    score: ranker.score(query, memory),
  }))
  .sort((a, b) => b.score - a.score);

console.table(results);
